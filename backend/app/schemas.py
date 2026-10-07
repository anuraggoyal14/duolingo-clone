"""Pydantic request/response models (the public API contract)."""

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

# --------------------------------------------------------------------------- user


class CourseInfo(BaseModel):
    code: str
    title: str
    from_language: str


class MeOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_color: str
    timezone: str
    xp_total: int
    gems: int
    hearts: int
    max_hearts: int
    next_heart_in_seconds: int | None  # relative, so it's immune to client clock skew
    heart_regen_minutes: int
    heart_refill_cost: int
    streak: int
    streak_extended_today: bool
    longest_streak: int
    daily_goal_xp: int
    daily_xp: int
    today: date
    course: CourseInfo
    dev_tools: bool


class MeUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=40)
    daily_goal_xp: int | None = None
    timezone: str | None = Field(default=None, max_length=64)


class DayXp(BaseModel):
    date: date
    xp: int


class AchievementOut(BaseModel):
    code: str
    title: str
    description: str
    icon: str
    metric: str
    threshold: int
    progress: int
    unlocked_at: datetime | None


class ProfileOut(BaseModel):
    user: MeOut
    joined_at: datetime
    lessons_completed: int
    skills_completed: int
    perfect_lessons: int
    league: str
    xp_last_7_days: list[DayXp]
    achievements: list[AchievementOut]


# --------------------------------------------------------------------------- course path


class SkillOut(BaseModel):
    id: int
    title: str
    icon: str
    status: Literal["completed", "active", "locked"]
    lessons_completed: int
    total_lessons: int
    next_lesson_id: int | None


class UnitOut(BaseModel):
    id: int
    position: int
    title: str
    description: str
    color: str
    skills: list[SkillOut]


class CoursePathOut(BaseModel):
    course: CourseInfo
    units: list[UnitOut]


# --------------------------------------------------------------------------- lessons


class LessonMeta(BaseModel):
    lesson_id: int | None
    skill_id: int | None
    skill_title: str
    unit_title: str | None
    lesson_number: int | None  # 1-based position within the skill
    lessons_in_skill: int | None


class AttemptOut(BaseModel):
    attempt_id: str
    kind: Literal["lesson", "practice"]
    meta: LessonMeta
    exercises: list[dict[str, Any]]  # public payloads, answer keys removed
    hearts: int
    max_hearts: int
    hearts_enabled: bool


class AnswerIn(BaseModel):
    exercise_id: int
    answer: int | str | list[str] | list[list[str]]


class AnswerOut(BaseModel):
    correct: bool
    solution: str
    note: str | None
    hearts: int
    remaining: int


class NewAchievement(BaseModel):
    code: str
    title: str
    description: str
    icon: str


class CompletionOut(BaseModel):
    xp_earned: int
    base_xp: int
    bonus_xp: int
    mistakes: int
    accuracy: int
    perfect: bool
    streak: int
    streak_extended: bool
    daily_xp: int
    daily_goal_xp: int
    daily_goal_reached_now: bool
    skill_completed: bool
    skill_title: str | None
    gems_earned: int
    hearts: int
    new_achievements: list[NewAchievement]


# --------------------------------------------------------------------------- leaderboard


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    display_name: str
    avatar_color: str
    weekly_xp: int
    is_current_user: bool


class LeaderboardOut(BaseModel):
    league: str
    week_start: date
    week_end: date
    days_left: int
    promotion_count: int
    demotion_count: int
    entries: list[LeaderboardEntry]


# --------------------------------------------------------------------------- dev


class AdvanceDayIn(BaseModel):
    days: int = Field(default=1, ge=1, le=30)


class DevStateOut(BaseModel):
    day_offset: int
    today: date
