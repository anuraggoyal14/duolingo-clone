"""Runtime configuration, read from environment variables with sensible local defaults."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


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


settings = Settings()
