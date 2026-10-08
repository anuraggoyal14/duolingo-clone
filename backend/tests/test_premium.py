"""Premium via Razorpay. The Razorpay API is replaced with a fake; signatures are real HMACs."""

import hashlib
import hmac
import itertools
import json
from datetime import timedelta

import pytest
from sqlalchemy import select

from app.config import settings
from app.models import Payment
from app.services import payments
from tests.conftest import FIXED_NOW
from tests.test_api import active_skill, answer, wrong_answer

KEY_SECRET = "test_key_secret"
WEBHOOK_SECRET = "test_webhook_secret"


@pytest.fixture
def payments_on(monkeypatch):
    monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_dummy", raising=False)
    monkeypatch.setattr(settings, "razorpay_key_secret", KEY_SECRET, raising=False)
    monkeypatch.setattr(settings, "razorpay_webhook_secret", WEBHOOK_SECRET, raising=False)
    counter = itertools.count(1)
    calls = []

    def fake_create_order(amount, receipt, notes):
        calls.append({"amount": amount, "receipt": receipt, "notes": notes})
        return {"id": f"order_TEST{next(counter)}", "amount": amount, "currency": "INR", "status": "created"}

    monkeypatch.setattr(payments, "create_razorpay_order", fake_create_order)
    return calls


def sign(order_id: str, payment_id: str) -> str:
    return hmac.new(KEY_SECRET.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()


def buy(client, payment_id="pay_TEST1"):
    order = client.post("/api/premium/order").json()
    res = client.post("/api/premium/verify", json={
        "razorpay_order_id": order["order_id"],
        "razorpay_payment_id": payment_id,
        "razorpay_signature": sign(order["order_id"], payment_id),
    })
    return order, res


def test_payments_disabled_without_keys(client):
    status = client.get("/api/premium").json()
    assert status["payments_enabled"] is False and status["is_premium"] is False
    res = client.post("/api/premium/order")
    assert res.status_code == 503 and res.json()["error"]["code"] == "payments_not_configured"


def test_order_amount_is_decided_by_the_server(client, db, payments_on):
    order = client.post("/api/premium/order").json()
    assert order["amount"] == settings.premium_price_inr * 100 and order["currency"] == "INR"
    assert order["key_id"] == "rzp_test_dummy" and "secret" not in json.dumps(order).lower()
    assert payments_on[0]["notes"]["product"] == "premium"
    row = db.scalar(select(Payment).where(Payment.order_id == order["order_id"]))
    assert row.status == "created" and row.payment_id is None


def test_valid_signature_activates_premium_once(client, db, payments_on):
    order, res = buy(client)
    me = res.json()
    assert res.status_code == 200 and me["is_premium"]
    assert me["premium_until"].startswith((FIXED_NOW + timedelta(days=30)).date().isoformat())

    # Replaying the same callback is harmless (idempotent).
    again = client.post("/api/premium/verify", json={
        "razorpay_order_id": order["order_id"],
        "razorpay_payment_id": "pay_TEST1",
        "razorpay_signature": sign(order["order_id"], "pay_TEST1"),
    }).json()
    assert again["premium_until"] == me["premium_until"]
    db.expire_all()
    assert db.scalar(select(Payment).where(Payment.order_id == order["order_id"])).status == "paid"


def test_forged_signature_is_rejected(client, payments_on):
    order = client.post("/api/premium/order").json()
    res = client.post("/api/premium/verify", json={
        "razorpay_order_id": order["order_id"],
        "razorpay_payment_id": "pay_FAKE",
        "razorpay_signature": "0" * 64,
    })
    assert res.status_code == 400 and res.json()["error"]["code"] == "invalid_signature"
    assert client.get("/api/me").json()["is_premium"] is False

    unknown = client.post("/api/premium/verify", json={
        "razorpay_order_id": "order_UNKNOWN", "razorpay_payment_id": "pay_X", "razorpay_signature": "x",
    })
    assert unknown.status_code == 404


def test_second_purchase_stacks_on_remaining_time(client, payments_on):
    buy(client, "pay_A")
    _, res = buy(client, "pay_B")
    until = res.json()["premium_until"]
    assert until.startswith((FIXED_NOW + timedelta(days=60)).date().isoformat())


def test_premium_means_unlimited_hearts(client, db, payments_on):
    buy(client)
    attempt = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()
    assert attempt["hearts_enabled"] is False
    hearts = client.get("/api/me").json()["hearts"]
    ex_id = attempt["exercises"][0]["id"]
    for _ in range(hearts + 2):  # more mistakes than hearts: never blocked, never loses one
        res = answer(client, attempt["attempt_id"], ex_id, wrong_answer(db, ex_id))
        assert res.status_code == 200 and res.json()["hearts"] == hearts


def test_premium_expires(client, fake_clock, payments_on):
    buy(client)
    fake_clock.now += timedelta(days=31)
    assert client.get("/api/me").json()["is_premium"] is False


def test_webhook_activates_premium_and_rejects_forgeries(client, payments_on):
    order = client.post("/api/premium/order").json()
    body = json.dumps({
        "event": "payment.captured",
        "payload": {"payment": {"entity": {"id": "pay_WEB1", "order_id": order["order_id"], "amount": order["amount"]}}},
    }).encode()
    good = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()

    forged = client.post("/api/premium/webhook", content=body, headers={"X-Razorpay-Signature": "bad"})
    assert forged.status_code == 400

    res = client.post("/api/premium/webhook", content=body, headers={"X-Razorpay-Signature": good})
    assert res.json() == {"status": "ok", "granted": True}
    assert client.get("/api/me").json()["is_premium"] is True
    # Razorpay retries webhooks; a duplicate delivery must not add more time.
    assert client.post("/api/premium/webhook", content=body, headers={"X-Razorpay-Signature": good}).json()["granted"] is False


def test_unexpected_provider_response_is_rejected(client, monkeypatch, payments_on):
    monkeypatch.setattr(payments, "create_razorpay_order", lambda amount, receipt, notes: {"id": "order_X", "amount": 1})
    res = client.post("/api/premium/order")
    assert res.status_code == 502 and res.json()["error"]["code"] == "payment_provider_error"
