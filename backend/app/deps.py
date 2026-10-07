from dataclasses import dataclass
from datetime import date, datetime

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.errors import AppError
from app.models import User
from app.services import clock
from app.services.gamification import sync_hearts


@dataclass
class RequestContext:
    """Everything a handler needs: DB session, the acting learner, and the (simulated) time."""

    db: Session
    user: User
    now: datetime  # naive UTC
    today: date  # learner's local calendar date


def get_context(db: Session = Depends(get_db)) -> RequestContext:
    # Authentication is intentionally simplified (see README): every request acts as the
    # default seeded learner. Swapping this for a session/JWT lookup is the only change needed.
    user = db.scalar(select(User).where(User.username == settings.default_username))
    if user is None:
        raise AppError(503, "not_seeded", "The database has not been seeded yet.")
    now = clock.utcnow(db)
    sync_hearts(user, now)
    return RequestContext(db=db, user=user, now=now, today=clock.local_date(now, user.timezone))
