import os
import tempfile
from datetime import datetime

import pytest

# Point the app at a throwaway database *before* app modules create the engine.
_TMP_DIR = tempfile.mkdtemp(prefix="duolingo-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_TMP_DIR, 'test.db')}"
os.environ["ENABLE_DEV_TOOLS"] = "true"
os.environ["DEFAULT_TIMEZONE"] = "UTC"
# Payments start disabled in tests (and real keys from backend/.env are never used).
for key in ("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"):
    os.environ[key] = ""

from fastapi.testclient import TestClient  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.seed.seeder import reset_database  # noqa: E402
from app.services import clock  # noqa: E402

# A fixed "real" time keeps day boundaries deterministic regardless of when tests run.
FIXED_NOW = datetime(2026, 10, 7, 12, 0, 0)  # a Wednesday, noon UTC


class FakeClock:
    def __init__(self):
        self.now = FIXED_NOW

    def __call__(self):
        return self.now


@pytest.fixture
def fake_clock(monkeypatch):
    fake = FakeClock()
    monkeypatch.setattr(clock, "_real_utcnow", fake)
    return fake


@pytest.fixture
def client(fake_clock):
    with TestClient(app) as test_client:
        with SessionLocal() as db:
            reset_database(db)
        yield test_client


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session
