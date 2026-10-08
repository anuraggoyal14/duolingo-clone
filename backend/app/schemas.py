"""Pydantic request/response models (the public API contract)."""

from datetime import date, datetime
from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, StringConstraints

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
    streak_freezes: int
    max_streak_freezes: int
    streak_freeze_cost: int
    is_premium: bool
    premium_until: datetime | None
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
    legendary: bool


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
    kind: Literal["lesson", "practice", "legendary"]
    meta: LessonMeta
    exercises: list[dict[str, Any]]  # public payloads, answer keys removed
    hearts: int
    max_hearts: int
    hearts_enabled: bool
    time_limit_seconds: int | None  # timed modes (legendary)
    max_mistakes: int | None  # legendary: the run fails on this many mistakes


class AnswerIn(BaseModel):
    exercise_id: int
    answer: int | str | list[str] | list[list[str]]


class AnswerOut(BaseModel):
    correct: bool
    solution: str
    note: str | None
    hearts: int
    remaining: int
    attempt_status: Literal["in_progress", "completed", "failed"]


class NewAchievement(BaseModel):
    code: str
    title: str
    description: str
    icon: str


class CompletionOut(BaseModel):
    kind: Literal["lesson", "practice", "legendary"]
    xp_earned: int
    base_xp: int
    bonus_xp: int
    mistakes: int
    accuracy: int
    perfect: bool
    streak: int
    streak_extended: bool
    streak_freezes_used: int
    daily_xp: int
    daily_goal_xp: int
    daily_goal_reached_now: bool
    skill_completed: bool
    legendary: bool
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


# --------------------------------------------------------------------------- quests


class QuestOut(BaseModel):
    code: str
    title: str
    progress: int
    target: int
    completed: bool
    claimed: bool
    reward_gems: int


class QuestsOut(BaseModel):
    quests: list[QuestOut]
    gems: int


# --------------------------------------------------------------------------- dev


class AdvanceDayIn(BaseModel):
    days: int = Field(default=1, ge=1, le=30)


class DevStateOut(BaseModel):
    day_offset: int
    today: date


# --------------------------------------------------------------------------- admin (content manager)
# Unlike the learner-facing models above, these include answer keys (`content` is the raw payload).

# Titles are stripped first so whitespace-only values count as empty.
ContentTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=64)]
ContentDescription = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
ExercisePrompt = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]


class AdminExerciseOut(BaseModel):
    id: int
    position: int
    type: str
    prompt: str
    content: dict[str, Any]  # everything except type/prompt, answer key included


class AdminLessonOut(BaseModel):
    id: int
    position: int
    exercises: list[AdminExerciseOut]


class AdminSkillOut(BaseModel):
    id: int
    position: int
    title: str
    icon: str
    lessons: list[AdminLessonOut]


class AdminUnitOut(BaseModel):
    id: int
    position: int
    title: str
    description: str
    color: str
    skills: list[AdminSkillOut]


class AdminCourseOut(BaseModel):
    code: str
    title: str


class AdminTotals(BaseModel):
    units: int
    skills: int
    lessons: int
    exercises: int
    by_type: dict[str, int]  # every exercise type, including those with zero exercises


class AdminContentOut(BaseModel):
    course: AdminCourseOut
    units: list[AdminUnitOut]
    totals: AdminTotals


class AdminUnitUpdate(BaseModel):
    title: ContentTitle | None = None
    description: ContentDescription | None = None


class AdminSkillUpdate(BaseModel):
    title: ContentTitle | None = None


class AdminExerciseUpdate(BaseModel):
    prompt: ExercisePrompt | None = None
    content: dict[str, Any] | None = None  # replaces the whole payload; the type cannot change


# --------------------------------------------------------------------------- premium


class PremiumStatusOut(BaseModel):
    payments_enabled: bool
    price_inr: int
    days: int
    is_premium: bool
    premium_until: datetime | None


class PremiumOrderOut(BaseModel):
    order_id: str
    amount: int  # paise
    currency: str
    key_id: str
    name: str
    description: str
    customer_name: str


class PremiumVerifyIn(BaseModel):
    razorpay_order_id: str = Field(min_length=1, max_length=64)
    razorpay_payment_id: str = Field(min_length=1, max_length=64)
    razorpay_signature: str = Field(min_length=1, max_length=128)
