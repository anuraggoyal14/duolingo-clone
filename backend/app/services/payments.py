"""Premium purchases through Razorpay (Orders API + Standard Checkout).

Flow:
1. `create_premium_order` creates a Razorpay order server-side (the amount is decided here,
   never by the browser) and stores it as a `created` Payment.
2. The browser opens Razorpay Checkout with that order id; Razorpay returns
   `razorpay_payment_id` + `razorpay_signature` to the page.
3. `confirm_payment` verifies HMAC_SHA256(order_id|payment_id, key_secret) and only then marks
   the payment `paid` and extends Premium. The webhook path does the same for payments whose
   browser callback never arrived. Both paths are idempotent.
"""

import base64
import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.errors import AppError, NotFound
from app.models import Payment, User

logger = logging.getLogger(__name__)

RAZORPAY_API = "https://api.razorpay.com/v1"
CURRENCY = "INR"
REQUEST_TIMEOUT_SECONDS = 15


def require_payments_enabled() -> None:
    if not settings.payments_enabled:
        raise AppError(503, "payments_not_configured", "Payments are not configured on this server.")


# --------------------------------------------------------------------------- premium state


def is_premium(user: User, now: datetime) -> bool:
    return user.premium_until is not None and user.premium_until > now


def extend_premium(user: User, now: datetime, days: int) -> None:
    """Add `days` of Premium, stacking on top of any time still remaining."""
    start = user.premium_until if is_premium(user, now) else now
    user.premium_until = start + timedelta(days=days)


# --------------------------------------------------------------------------- Razorpay API


def _razorpay_request(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    token = base64.b64encode(f"{settings.razorpay_key_id}:{settings.razorpay_key_secret}".encode()).decode()
    request = urllib.request.Request(
        f"{RAZORPAY_API}{path}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Basic {token}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as exc:
        # Log Razorpay's reason (never the credentials) and return a generic error to the client.
        detail = exc.read().decode(errors="replace")[:300]
        logger.warning("Razorpay %s failed with HTTP %s: %s", path, exc.code, detail)
        if exc.code == 401:
            raise AppError(502, "payment_provider_auth", "The payment provider rejected the API keys.") from exc
        raise AppError(502, "payment_provider_error", "The payment provider returned an error.") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Razorpay %s unreachable: %s", path, exc)
        raise AppError(504, "payment_provider_unreachable", "Couldn't reach the payment provider. Try again.") from exc


def create_razorpay_order(amount: int, receipt: str, notes: dict[str, str]) -> dict[str, Any]:
    """POST /v1/orders. Separated out so tests can replace it without network access."""
    return _razorpay_request("/orders", {"amount": amount, "currency": CURRENCY, "receipt": receipt, "notes": notes})


# --------------------------------------------------------------------------- signatures


def _hmac_hex(secret: str, message: bytes) -> str:
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def payment_signature_valid(order_id: str, payment_id: str, signature: str) -> bool:
    expected = _hmac_hex(settings.razorpay_key_secret, f"{order_id}|{payment_id}".encode())
    return hmac.compare_digest(expected, signature)


def webhook_signature_valid(body: bytes, signature: str) -> bool:
    if not settings.razorpay_webhook_secret:
        return False
    return hmac.compare_digest(_hmac_hex(settings.razorpay_webhook_secret, body), signature)


# --------------------------------------------------------------------------- flows


def create_premium_order(db: Session, user: User, now: datetime) -> Payment:
    require_payments_enabled()
    amount = settings.premium_price_inr * 100  # paise
    receipt = f"premium-u{user.id}-{int(now.timestamp())}"
    order = create_razorpay_order(amount, receipt, {"user_id": str(user.id), "product": "premium"})
    if order.get("amount") != amount or not str(order.get("id", "")).startswith("order_"):
        logger.warning("Unexpected Razorpay order response: %s", {k: order.get(k) for k in ("id", "amount")})
        raise AppError(502, "payment_provider_error", "The payment provider returned an unexpected order.")
    payment = Payment(
        user_id=user.id,
        order_id=order["id"],
        amount=amount,
        currency=CURRENCY,
        status="created",
        premium_days=settings.premium_days,
        created_at=now,
    )
    db.add(payment)
    return payment


def _mark_paid(db: Session, payment: Payment, payment_id: str, now: datetime) -> bool:
    """Mark a payment paid and grant Premium. Returns False if it was already paid."""
    if payment.status == "paid":
        return False
    payment.status = "paid"
    payment.payment_id = payment_id
    payment.paid_at = now
    user = db.get(User, payment.user_id)
    extend_premium(user, now, payment.premium_days)
    logger.info("Premium activated for user %s via %s", user.id, payment.order_id)
    return True


def confirm_payment(
    db: Session, user: User, order_id: str, payment_id: str, signature: str, now: datetime
) -> Payment:
    """Checkout callback: trust the payment only if Razorpay's signature checks out."""
    require_payments_enabled()
    payment = db.scalar(select(Payment).where(Payment.order_id == order_id))
    if payment is None or payment.user_id != user.id:
        raise NotFound("Order")
    if not payment_signature_valid(order_id, payment_id, signature):
        raise AppError(400, "invalid_signature", "Payment verification failed.")
    if payment.status == "paid" and payment.payment_id != payment_id:
        raise AppError(409, "order_already_paid", "This order was already paid.")
    _mark_paid(db, payment, payment_id, now)
    return payment


def handle_webhook(db: Session, body: bytes, signature: str, now: datetime) -> bool:
    """Razorpay webhook (payment.captured / order.paid). Returns True if Premium was granted."""
    if not webhook_signature_valid(body, signature):
        raise AppError(400, "invalid_signature", "Webhook verification failed.")
    event = json.loads(body)
    entity = event.get("payload", {}).get("payment", {}).get("entity", {})
    order_id, payment_id = entity.get("order_id"), entity.get("id")
    if event.get("event") not in {"payment.captured", "order.paid"} or not order_id or not payment_id:
        return False
    payment = db.scalar(select(Payment).where(Payment.order_id == order_id))
    if payment is None or entity.get("amount") != payment.amount:
        return False
    return _mark_paid(db, payment, payment_id, now)
