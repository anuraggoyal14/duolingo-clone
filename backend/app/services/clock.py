"""Single source of "now" for all game logic.

Streaks and heart regeneration depend on time, so every service asks this module instead of
calling `datetime.now()` directly. A persisted day offset (set via the dev endpoints) lets
reviewers simulate "tomorrow" without touching the system clock, and tests can monkeypatch
`_real_utcnow`.
"""

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy.orm import Session

from app.models import AppSetting

DAY_OFFSET_KEY = "day_offset"


def _real_utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def get_day_offset(db: Session) -> int:
    setting = db.get(AppSetting, DAY_OFFSET_KEY)
    return int(setting.value) if setting else 0


def set_day_offset(db: Session, days: int) -> None:
    setting = db.get(AppSetting, DAY_OFFSET_KEY)
    if setting is None:
        db.add(AppSetting(key=DAY_OFFSET_KEY, value=str(days)))
    else:
        setting.value = str(days)


def utcnow(db: Session) -> datetime:
    """Naive UTC "now", shifted by the simulated day offset."""
    return _real_utcnow() + timedelta(days=get_day_offset(db))


def safe_zone(tz_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, ValueError):
        return ZoneInfo("UTC")


def is_valid_timezone(tz_name: str) -> bool:
    try:
        ZoneInfo(tz_name)
        return True
    except (ZoneInfoNotFoundError, ValueError):
        return False


def local_date(now_utc: datetime, tz_name: str) -> date:
    return now_utc.replace(tzinfo=UTC).astimezone(safe_zone(tz_name)).date()
