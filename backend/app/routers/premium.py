from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import RequestContext, get_context
from app.presenters import build_me
from app.schemas import MeOut, PremiumOrderOut, PremiumStatusOut, PremiumVerifyIn
from app.services import clock, payments

router = APIRouter(prefix="/premium", tags=["premium"])

PRODUCT_NAME = "Premium"
PRODUCT_DESCRIPTION = "Unlimited hearts"


@router.get("", response_model=PremiumStatusOut)
def get_premium(ctx: RequestContext = Depends(get_context)):
    """Plan details, whether payments are configured, and the learner's Premium status."""
    return PremiumStatusOut(
        payments_enabled=settings.payments_enabled,
        price_inr=settings.premium_price_inr,
        days=settings.premium_days,
        is_premium=payments.is_premium(ctx.user, ctx.now),
        premium_until=ctx.user.premium_until,
    )


@router.post("/order", response_model=PremiumOrderOut, status_code=201)
def create_order(ctx: RequestContext = Depends(get_context)):
    """Create a Razorpay order; the browser then opens Razorpay Checkout with it."""
    payment = payments.create_premium_order(ctx.db, ctx.user, ctx.now)
    ctx.db.commit()
    return PremiumOrderOut(
        order_id=payment.order_id,
        amount=payment.amount,
        currency=payment.currency,
        key_id=settings.razorpay_key_id,  # public key id only; the secret stays on the server
        name=PRODUCT_NAME,
        description=f"{PRODUCT_DESCRIPTION} for {payment.premium_days} days",
        customer_name=ctx.user.display_name,
    )


@router.post("/verify", response_model=MeOut)
def verify(body: PremiumVerifyIn, ctx: RequestContext = Depends(get_context)):
    """Checkout success callback: verify Razorpay's signature, then activate Premium."""
    payments.confirm_payment(
        ctx.db, ctx.user, body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature, ctx.now
    )
    ctx.db.commit()
    return build_me(ctx)


@router.post("/webhook")
async def webhook(
    request: Request,
    x_razorpay_signature: str = Header(default=""),
    db: Session = Depends(get_db),
):
    """Razorpay webhook: activates Premium even if the browser closed before /verify ran."""
    body = await request.body()
    granted = payments.handle_webhook(db, body, x_razorpay_signature, clock.utcnow(db))
    db.commit()
    return {"status": "ok", "granted": granted}
