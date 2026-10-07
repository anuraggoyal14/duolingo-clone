"""Daily quests: three goals that reset every (local) day, each with a claimable gem chest.

Progress is derived from data that already exists (the XP ledger and lesson attempts), so
only claims need to be stored.
"""

from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.errors import AppError, NotFound
from app.models import DailyQuestClaim, LessonAttempt, User, XpEvent
from app.services import gamification as game
from app.services.clock import safe_zone

QUEST_REWARD_GEMS = 15
LESSONS_TARGET = 2
PERFECT_TARGET = 1


@dataclass
class Quest:
    code: str
    title: str
    progress: int
    target: int
    reward_gems: int
    claimed: bool

    @property
    def completed(self) -> bool:
        return self.progress >= self.target


def _local_day_bounds_utc(day: date, tz_name: str) -> tuple[datetime, datetime]:
    """[start, end) of a local calendar day, as naive UTC datetimes."""
    zone = safe_zone(tz_name)
    start = datetime.combine(day, time.min, tzinfo=zone).astimezone(UTC).replace(tzinfo=None)
    end = datetime.combine(day + timedelta(days=1), time.min, tzinfo=zone).astimezone(UTC).replace(tzinfo=None)
    return start, end


def daily_quests(db: Session, user: User, today: date) -> list[Quest]:
    lessons_today = db.scalar(
        select(func.count()).where(
            XpEvent.user_id == user.id,
            XpEvent.activity_date == today,
            XpEvent.source.in_(("lesson", "legendary")),
        )
    )
    start, end = _local_day_bounds_utc(today, user.timezone)
    perfect_today = db.scalar(
        select(func.count()).where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.kind == "lesson",
            LessonAttempt.status == "completed",
            LessonAttempt.mistakes == 0,
            LessonAttempt.finished_at >= start,
            LessonAttempt.finished_at < end,
        )
    )
    claimed = set(
        db.scalars(
            select(DailyQuestClaim.quest_code).where(
                DailyQuestClaim.user_id == user.id, DailyQuestClaim.day == today
            )
        )
    )
    quests = [
        Quest("earn_xp", f"Earn {user.daily_goal_xp} XP", game.xp_on(db, user.id, today), user.daily_goal_xp, QUEST_REWARD_GEMS, False),
        Quest("complete_lessons", f"Complete {LESSONS_TARGET} lessons", int(lessons_today or 0), LESSONS_TARGET, QUEST_REWARD_GEMS, False),
        Quest("perfect_lesson", "Get 100% in a lesson", int(perfect_today or 0), PERFECT_TARGET, QUEST_REWARD_GEMS, False),
    ]
    for quest in quests:
        quest.claimed = quest.code in claimed
        quest.progress = min(quest.progress, quest.target)
    return quests


def claim_quest(db: Session, user: User, code: str, today: date, now: datetime) -> Quest:
    quest = next((q for q in daily_quests(db, user, today) if q.code == code), None)
    if quest is None:
        raise NotFound("Quest")
    if quest.claimed:
        raise AppError(409, "already_claimed", "You already opened this chest today.")
    if not quest.completed:
        raise AppError(409, "quest_incomplete", "Finish the quest to open its chest.")
    db.add(DailyQuestClaim(user_id=user.id, quest_code=code, day=today, gems_awarded=quest.reward_gems, claimed_at=now))
    user.gems += quest.reward_gems
    quest.claimed = True
    return quest
