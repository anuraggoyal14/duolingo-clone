"""Runtime configuration, read from environment variables with sensible local defaults."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    """Load KEY=VALUE lines from backend/.env (git-ignored) without overriding real env vars.

    Keeps secrets such as the Razorpay key secret out of source code and shell history."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv(BASE_DIR / ".env")


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'duolingo.db'}")
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    # Minutes needed to regenerate a single heart.
    heart_regen_minutes: int = int(os.getenv("HEART_REGEN_MINUTES", "30"))
    # Exposes /api/dev/* (time travel + reset) so streak logic can be demoed and tested.
    enable_dev_tools: bool = _env_bool("ENABLE_DEV_TOOLS", True)
    # Authentication is simplified: every request acts as this seeded learner.
    default_username: str = os.getenv("DEFAULT_USERNAME", "learner")
    # Timezone of the seeded learner; streak days and daily goals use the learner's local date.
    default_timezone: str = os.getenv("DEFAULT_TIMEZONE", "UTC")

    # Razorpay (Premium). Payments are disabled until both keys are set; use Test Mode keys
    # (rzp_test_...) for demos. The secret never leaves the server.
    razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "")
    razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    razorpay_webhook_secret: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    premium_price_inr: int = int(os.getenv("PREMIUM_PRICE_INR", "499"))
    premium_days: int = int(os.getenv("PREMIUM_DAYS", "30"))

    @property
    def payments_enabled(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)


settings = Settings()
