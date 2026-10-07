from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.deps import RequestContext, get_context
from app.errors import AppError
from app.models import Achievement, UserAchievement
from app.presenters import build_me
from app.schemas import AchievementOut, DayXp, MeOut, MeUpdate, ProfileOut
from app.services import clock
from app.services import gamification as game

router = APIRouter(tags=["learner"])


@router.get("/me", response_model=MeOut)
def get_me(ctx: RequestContext = Depends(get_context)):
    return build_me(ctx)


@router.patch("/me", response_model=MeOut)
def update_me(body: MeUpdate, ctx: RequestContext = Depends(get_context)):
    user = ctx.user
    if body.daily_goal_xp is not None:
        if body.daily_goal_xp not in game.DAILY_GOAL_OPTIONS:
            raise AppError(422, "invalid_goal", f"Daily goal must be one of {game.DAILY_GOAL_OPTIONS}")
        user.daily_goal_xp = body.daily_goal_xp
    if body.timezone is not None:
        if not clock.is_valid_timezone(body.timezone):
            raise AppError(422, "invalid_timezone", "Unknown timezone")
        user.timezone = body.timezone
        ctx.today = clock.local_date(ctx.now, user.timezone)
    if body.display_name is not None:
        user.display_name = body.display_name.strip() or user.display_name
    ctx.db.commit()
    return build_me(ctx)


@router.get("/profile", response_model=ProfileOut)
def get_profile(ctx: RequestContext = Depends(get_context)):
    db, user = ctx.db, ctx.user
    metrics = game.achievement_metrics(db, user)
    unlocked = {
        ua.achievement_id: ua.unlocked_at
        for ua in db.scalars(select(UserAchievement).where(UserAchievement.user_id == user.id))
    }
    achievements = [
        AchievementOut(
            code=a.code,
            title=a.title,
            description=a.description,
            icon=a.icon,
            metric=a.metric,
            threshold=a.threshold,
            progress=min(metrics.get(a.metric, 0), a.threshold),
            unlocked_at=unlocked.get(a.id),
        )
        for a in db.scalars(select(Achievement).order_by(Achievement.id))
    ]

    start = ctx.today - timedelta(days=6)
    by_day = game.xp_by_day(db, user.id, start, ctx.today)
    week = [DayXp(date=start + timedelta(days=i), xp=by_day.get(start + timedelta(days=i), 0)) for i in range(7)]

    return ProfileOut(
        user=build_me(ctx),
        joined_at=user.created_at,
        lessons_completed=metrics["lessons"],
        skills_completed=metrics["skills"],
        perfect_lessons=metrics["perfect"],
        league="Bronze",
        xp_last_7_days=week,
        achievements=achievements,
    )
