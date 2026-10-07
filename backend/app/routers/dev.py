"""Developer/reviewer tools. Disabled when ENABLE_DEV_TOOLS=false."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import RequestContext, get_context
from app.errors import AppError
from app.schemas import AdvanceDayIn, DevStateOut
from app.seed.seeder import reset_database
from app.services import clock

router = APIRouter(prefix="/dev", tags=["dev"])


def _require_dev_tools() -> None:
    if not settings.enable_dev_tools:
        raise AppError(404, "not_found", "Not found")


@router.post("/advance-day", response_model=DevStateOut, dependencies=[Depends(_require_dev_tools)])
def advance_day(body: AdvanceDayIn, ctx: RequestContext = Depends(get_context)):
    """Simulate the passage of time so streak/heart logic can be demoed without waiting."""
    offset = clock.get_day_offset(ctx.db) + body.days
    clock.set_day_offset(ctx.db, offset)
    ctx.db.commit()
    now = clock.utcnow(ctx.db)
    return DevStateOut(day_offset=offset, today=clock.local_date(now, ctx.user.timezone))


@router.post("/reset", response_model=DevStateOut, dependencies=[Depends(_require_dev_tools)])
def reset(db: Session = Depends(get_db)):
    """Wipe all progress and re-seed the demo learner and course."""
    reset_database(db)
    now = clock.utcnow(db)
    return DevStateOut(day_offset=0, today=clock.local_date(now, settings.default_timezone))
