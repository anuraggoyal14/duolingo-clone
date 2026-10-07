"""SQLAlchemy ORM models.

Content hierarchy:  Course -> Unit -> Skill -> Lesson -> Exercise
Learner state:      User, UserSkillProgress, LessonAttempt, XpEvent, UserAchievement, DailyQuestClaim
Catalog / misc:     Achievement, AppSetting

All timestamps are stored as naive UTC datetimes. Calendar dates used for streaks and
daily goals (`XpEvent.activity_date`, `User.last_streak_date`) are the learner's *local* date.
"""

from datetime import date, datetime

from sqlalchemy import (
    JSON,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

EXERCISE_TYPES = ("multiple_choice", "translate", "match_pairs", "fill_blank", "type_answer")


# --------------------------------------------------------------------------- content


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(8), unique=True)  # learning language, e.g. "es"
    title: Mapped[str] = mapped_column(String(64))
    from_language: Mapped[str] = mapped_column(String(8))  # UI language, e.g. "en"

    units: Mapped[list["Unit"]] = relationship(
        back_populates="course", order_by="Unit.position", cascade="all, delete-orphan"
    )


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("course_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(16))

    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list["Skill"]] = relationship(
        back_populates="unit", order_by="Skill.position", cascade="all, delete-orphan"
    )


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("unit_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(64))
    icon: Mapped[str] = mapped_column(String(32))

    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="skill", order_by="Lesson.position", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("skill_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)  # 0-based order within the skill

    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="lesson", order_by="Exercise.position", cascade="all, delete-orphan"
    )


class Exercise(Base):
    """A single challenge. `content` holds the type-specific payload, including the
    answer key, which is never sent to the client (see services/grading.py)."""

    __tablename__ = "exercises"
    __table_args__ = (
        UniqueConstraint("lesson_id", "position"),
        CheckConstraint(f"type IN {EXERCISE_TYPES}", name="ck_exercise_type"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(32))
    prompt: Mapped[str] = mapped_column(String(255))
    content: Mapped[dict] = mapped_column(JSON)

    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


# --------------------------------------------------------------------------- learners


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("hearts >= 0", name="ck_user_hearts_non_negative"),
        CheckConstraint("gems >= 0", name="ck_user_gems_non_negative"),
        CheckConstraint("streak_freezes BETWEEN 0 AND 2", name="ck_user_streak_freezes"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True)
    display_name: Mapped[str] = mapped_column(String(64))
    avatar_color: Mapped[str] = mapped_column(String(16))
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    is_demo_peer: Mapped[bool] = mapped_column(default=False)  # seeded leaderboard opponents

    xp_total: Mapped[int] = mapped_column(Integer, default=0)
    gems: Mapped[int] = mapped_column(Integer, default=0)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    # Anchor for lazy heart regeneration (see services/gamification.py).
    hearts_updated_at: Mapped[datetime] = mapped_column(DateTime)

    streak_count: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_streak_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Equipped streak freezes: each one protects the streak for one missed day.
    streak_freezes: Mapped[int] = mapped_column(Integer, default=0)
    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=20)

    created_at: Mapped[datetime] = mapped_column(DateTime)

    skill_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    legendary_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # gold skill

    user: Mapped[User] = relationship(back_populates="skill_progress")
    skill: Mapped[Skill] = relationship()


class LessonAttempt(Base):
    """One run through a lesson, a practice session or a timed Legendary challenge. Tracks
    which exercises have been answered correctly so the server can verify completion and
    award XP exactly once."""

    __tablename__ = "lesson_attempts"
    __table_args__ = (
        CheckConstraint("kind IN ('lesson', 'practice', 'legendary')", name="ck_attempt_kind"),
        CheckConstraint("status IN ('in_progress', 'completed', 'failed')", name="ck_attempt_status"),
        Index("ix_attempt_user_status", "user_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # uuid4
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int | None] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True
    )  # NULL for practice and legendary sessions
    skill_id: Mapped[int | None] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), nullable=True
    )  # set for legendary challenges
    kind: Mapped[str] = mapped_column(String(16), default="lesson")
    exercise_ids: Mapped[list[int]] = mapped_column(JSON)
    correct_ids: Mapped[list[int]] = mapped_column(JSON, default=list)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="in_progress")
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # cached completion summary
    started_at: Mapped[datetime] = mapped_column(DateTime)
    deadline_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # timed modes
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    lesson: Mapped[Lesson | None] = relationship()
    skill: Mapped[Skill | None] = relationship()


class XpEvent(Base):
    """Append-only XP ledger. Daily goal, weekly leaderboard and the XP chart are all
    derived from it; `User.xp_total` is a denormalized running total."""

    __tablename__ = "xp_events"
    __table_args__ = (Index("ix_xp_user_date", "user_id", "activity_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    amount: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(32))  # lesson | practice | seed
    activity_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True)
    title: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(32))
    metric: Mapped[str] = mapped_column(String(32))  # streak | xp | lessons | perfect | skills | legendary
    threshold: Mapped[int] = mapped_column(Integer)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"))
    unlocked_at: Mapped[datetime] = mapped_column(DateTime)

    achievement: Mapped[Achievement] = relationship()


class DailyQuestClaim(Base):
    """A claimed daily-quest chest. Quest progress itself is derived from the XP ledger and
    lesson attempts; only the claim (reward granted) needs to be stored."""

    __tablename__ = "daily_quest_claims"
    __table_args__ = (UniqueConstraint("user_id", "quest_code", "day"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    quest_code: Mapped[str] = mapped_column(String(32))
    day: Mapped[date] = mapped_column(Date)  # learner's local date
    gems_awarded: Mapped[int] = mapped_column(Integer)
    claimed_at: Mapped[datetime] = mapped_column(DateTime)


class AppSetting(Base):
    """Small key/value store (currently only the simulated day offset used by dev tools)."""

    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(255))
