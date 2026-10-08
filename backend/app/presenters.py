"""Builders that turn ORM state into API response models."""

from datetime import datetime

from sqlalchemy import select

from app.config import settings
from app.deps import RequestContext
from app.models import Course
from app.schemas import CourseInfo, MeOut
from app.services import gamification as game
from app.services import payments


def course_info(course: Course) -> CourseInfo:
    return CourseInfo(code=course.code, title=course.title, from_language=course.from_language)


def _seconds_until(moment: datetime | None, now: datetime) -> int | None:
    return None if moment is None else max(0, int((moment - now).total_seconds()))


def build_me(ctx: RequestContext) -> MeOut:
    user = ctx.user
    course = ctx.db.scalar(select(Course))
    return MeOut(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_color=user.avatar_color,
        timezone=user.timezone,
        xp_total=user.xp_total,
        gems=user.gems,
        hearts=user.hearts,
        max_hearts=game.MAX_HEARTS,
        next_heart_in_seconds=_seconds_until(game.next_heart_at(user), ctx.now),
        heart_regen_minutes=settings.heart_regen_minutes,
        heart_refill_cost=game.HEART_REFILL_COST_GEMS,
        streak=game.current_streak(user, ctx.today),
        streak_extended_today=game.extended_today(user, ctx.today),
        longest_streak=user.longest_streak,
        streak_freezes=user.streak_freezes,
        max_streak_freezes=game.MAX_STREAK_FREEZES,
        streak_freeze_cost=game.STREAK_FREEZE_COST_GEMS,
        is_premium=payments.is_premium(user, ctx.now),
        premium_until=user.premium_until,
        daily_goal_xp=user.daily_goal_xp,
        daily_xp=game.xp_on(ctx.db, user.id, ctx.today),
        today=ctx.today,
        course=course_info(course),
        dev_tools=settings.enable_dev_tools,
    )
