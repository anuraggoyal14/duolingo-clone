from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.deps import RequestContext, get_context
from app.models import User, XpEvent
from app.schemas import LeaderboardEntry, LeaderboardOut

router = APIRouter(tags=["leaderboard"])

PROMOTION_COUNT = 3
DEMOTION_COUNT = 3


@router.get("/leaderboard", response_model=LeaderboardOut)
def get_leaderboard(ctx: RequestContext = Depends(get_context)):
    """Weekly league (Monday-Sunday in the learner's timezone), ranked by XP earned this week."""
    week_start = ctx.today - timedelta(days=ctx.today.weekday())
    week_end = week_start + timedelta(days=6)

    weekly_xp = (
        select(XpEvent.user_id, func.sum(XpEvent.amount).label("xp"))
        .where(XpEvent.activity_date.between(week_start, week_end))
        .group_by(XpEvent.user_id)
        .subquery()
    )
    rows = ctx.db.execute(
        select(User, func.coalesce(weekly_xp.c.xp, 0))
        .outerjoin(weekly_xp, weekly_xp.c.user_id == User.id)
        .order_by(func.coalesce(weekly_xp.c.xp, 0).desc(), User.display_name)
    ).all()

    entries = [
        LeaderboardEntry(
            rank=rank,
            user_id=user.id,
            display_name=user.display_name,
            avatar_color=user.avatar_color,
            weekly_xp=int(xp),
            is_current_user=user.id == ctx.user.id,
        )
        for rank, (user, xp) in enumerate(rows, start=1)
    ]
    return LeaderboardOut(
        league="Bronze",
        week_start=week_start,
        week_end=week_end,
        days_left=(week_end - ctx.today).days,
        promotion_count=PROMOTION_COUNT,
        demotion_count=DEMOTION_COUNT,
        entries=entries,
    )
