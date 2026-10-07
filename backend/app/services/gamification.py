"""Hearts, streaks, XP and achievements: the rules of the game, kept free of HTTP concerns.

Time is always passed in explicitly (`now` = naive UTC, `today` = learner's local date), which
keeps these functions deterministic and easy to unit test.
"""

from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    Achievement,
    LessonAttempt,
    User,
    UserAchievement,
    UserSkillProgress,
    XpEvent,
)

MAX_HEARTS = 5
HEART_REFILL_COST_GEMS = 350
LESSON_XP = 10
PERFECT_LESSON_BONUS_XP = 5
PRACTICE_XP = 10
SKILL_COMPLETE_GEMS = 20
DAILY_GOAL_OPTIONS = (10, 20, 30, 50)
STREAK_FREEZE_COST_GEMS = 200
MAX_STREAK_FREEZES = 2


# --------------------------------------------------------------------------- hearts


def _regen_interval() -> timedelta:
    return timedelta(minutes=settings.heart_regen_minutes)


def sync_hearts(user: User, now: datetime) -> None:
    """Apply lazy regeneration: one heart per interval elapsed since `hearts_updated_at`.

    Instead of a background job, regeneration is computed whenever the user is read.
    The anchor only advances by whole intervals so partial progress is never lost."""
    if user.hearts >= MAX_HEARTS:
        user.hearts = MAX_HEARTS
        user.hearts_updated_at = now
        return
    interval = _regen_interval()
    gained = int((now - user.hearts_updated_at) / interval)
    if gained <= 0:
        return
    user.hearts = min(MAX_HEARTS, user.hearts + gained)
    user.hearts_updated_at = now if user.hearts >= MAX_HEARTS else user.hearts_updated_at + gained * interval


def next_heart_at(user: User) -> datetime | None:
    if user.hearts >= MAX_HEARTS:
        return None
    return user.hearts_updated_at + _regen_interval()


def lose_heart(user: User, now: datetime) -> None:
    sync_hearts(user, now)
    if user.hearts >= MAX_HEARTS:
        user.hearts_updated_at = now  # regeneration clock starts at the first lost heart
    user.hearts = max(0, user.hearts - 1)


def gain_heart(user: User, now: datetime) -> None:
    sync_hearts(user, now)
    user.hearts = min(MAX_HEARTS, user.hearts + 1)
    if user.hearts >= MAX_HEARTS:
        user.hearts_updated_at = now


def refill_hearts(user: User, now: datetime) -> None:
    user.hearts = MAX_HEARTS
    user.hearts_updated_at = now


# --------------------------------------------------------------------------- streak


def missed_days(user: User, today: date) -> int:
    """Whole days skipped since the last activity (0 if active today or yesterday)."""
    if user.last_streak_date is None:
        return 0
    return max(0, (today - user.last_streak_date).days - 1)


def current_streak(user: User, today: date) -> int:
    """A streak survives until the end of the day after the last activity, plus one extra
    day per equipped streak freeze."""
    if user.last_streak_date is None:
        return 0
    if missed_days(user, today) <= user.streak_freezes:
        return user.streak_count
    return 0


def extended_today(user: User, today: date) -> bool:
    return user.last_streak_date == today


def register_activity(user: User, today: date) -> tuple[bool, int]:
    """Record a day of activity.

    Returns (extended, freezes_used): whether this call extended the streak, and how many
    streak freezes were consumed to bridge missed days."""
    # ">=" also covers a learner moving to an earlier timezone after already practising
    # "tomorrow" in the old one: that must not reset the streak.
    if user.last_streak_date is not None and user.last_streak_date >= today:
        return False, 0
    missed = missed_days(user, today)
    freezes_used = 0
    if user.last_streak_date is not None and missed <= user.streak_freezes:
        freezes_used = missed
        user.streak_freezes -= missed
        user.streak_count += 1
    else:
        user.streak_count = 1
    user.last_streak_date = today
    user.longest_streak = max(user.longest_streak, user.streak_count)
    return True, freezes_used


# --------------------------------------------------------------------------- XP


def award_xp(db: Session, user: User, amount: int, source: str, today: date, now: datetime) -> None:
    user.xp_total += amount
    db.add(XpEvent(user_id=user.id, amount=amount, source=source, activity_date=today, created_at=now))


def xp_on(db: Session, user_id: int, day: date) -> int:
    total = db.scalar(
        select(func.coalesce(func.sum(XpEvent.amount), 0)).where(
            XpEvent.user_id == user_id, XpEvent.activity_date == day
        )
    )
    return int(total or 0)


def xp_by_day(db: Session, user_id: int, start: date, end: date) -> dict[date, int]:
    rows = db.execute(
        select(XpEvent.activity_date, func.sum(XpEvent.amount))
        .where(XpEvent.user_id == user_id, XpEvent.activity_date.between(start, end))
        .group_by(XpEvent.activity_date)
    ).all()
    return {day: int(total) for day, total in rows}


# --------------------------------------------------------------------------- achievements


def achievement_metrics(db: Session, user: User) -> dict[str, int]:
    lessons_done = db.scalar(
        select(func.count()).where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.kind == "lesson",
            LessonAttempt.status == "completed",
        )
    )
    perfect_lessons = db.scalar(
        select(func.count()).where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.kind == "lesson",
            LessonAttempt.status == "completed",
            LessonAttempt.mistakes == 0,
        )
    )
    legendary_done = db.scalar(
        select(func.count()).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.legendary_at.is_not(None)
        )
    )
    skills_done = db.scalar(
        select(func.count()).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.completed_at.is_not(None)
        )
    )
    return {
        "streak": user.longest_streak,
        "xp": user.xp_total,
        "lessons": int(lessons_done or 0),
        "perfect": int(perfect_lessons or 0),
        "skills": int(skills_done or 0),
        "legendary": int(legendary_done or 0),
    }


def unlock_achievements(db: Session, user: User, now: datetime) -> list[Achievement]:
    """Grant every achievement whose threshold is now met. Returns the newly unlocked ones."""
    db.flush()  # make pending attempt/progress rows visible to the metric queries
    metrics = achievement_metrics(db, user)
    owned = set(
        db.scalars(select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id))
    )
    unlocked = []
    for achievement in db.scalars(select(Achievement).order_by(Achievement.id)):
        if achievement.id in owned:
            continue
        if metrics.get(achievement.metric, 0) >= achievement.threshold:
            db.add(UserAchievement(user_id=user.id, achievement_id=achievement.id, unlocked_at=now))
            unlocked.append(achievement)
    return unlocked
