"""Seeds the course, achievement catalog, the demo learner (with some progress) and a few
leaderboard peers. Idempotent: `seed_if_empty` does nothing when a course already exists."""

import logging
import random
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base
from app.models import (
    EXERCISE_TYPES,
    Achievement,
    Course,
    Exercise,
    Lesson,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserSkillProgress,
    XpEvent,
)
from app.seed.course_content import COURSE
from app.services import clock
from app.services import gamification as game

logger = logging.getLogger(__name__)

ACHIEVEMENTS = [
    # code, title, description, icon, metric, threshold
    ("first_lesson", "First Steps", "Complete your first lesson", "footprints", "lessons", 1),
    ("wildfire", "Wildfire", "Reach a 3 day streak", "flame", "streak", 3),
    ("on_fire", "On Fire", "Reach a 7 day streak", "flame", "streak", 7),
    ("sage", "Sage", "Earn 250 XP", "sparkles", "xp", 250),
    ("scholar", "Scholar", "Earn 1000 XP", "book", "xp", 1000),
    ("sharpshooter", "Sharpshooter", "Complete 3 lessons without a mistake", "target", "perfect", 3),
    ("conqueror", "Conqueror", "Complete 3 skills", "crown", "skills", 3),
    ("dedicated", "Dedicated", "Complete 15 lessons", "medal", "lessons", 15),
]

# Fictional leaderboard peers: (username, display name, avatar color, weekly XP)
PEERS = [
    ("mia_reads", "Mia", "pink", 245),
    ("leo.k", "Leo K.", "blue", 190),
    ("sofia22", "Sofia", "purple", 160),
    ("arjun_learns", "Arjun", "orange", 120),
    ("noah", "Noah", "green", 95),
    ("emma.v", "Emma V.", "red", 70),
    ("kenji", "Kenji", "teal", 55),
    ("zara", "Zara", "yellow", 30),
    ("lucas_b", "Lucas", "blue", 10),
]

# Demo learner progress: number of completed lessons per skill (in path order).
LEARNER_SKILL_PROGRESS = [2, 2, 1]
LEARNER_STREAK_DAYS = 4


def _validate_exercise(ex: dict) -> None:
    kind = ex["type"]
    assert kind in EXERCISE_TYPES, f"unknown exercise type {kind}"
    if kind == "multiple_choice":
        assert 0 <= ex["answer"] < len(ex["choices"])
    elif kind == "translate":
        bank = list(ex["word_bank"])
        for word in ex["answers"][0].split():
            word = word.strip(".,!?¿¡")
            assert word in bank, f"'{word}' missing from word bank of {ex['source']!r}"
            bank.remove(word)
    elif kind == "fill_blank":
        assert ex["sentence"].count("___") == 1 and ex["answer"] in ex["choices"]
    elif kind == "match_pairs":
        assert len({p[0] for p in ex["pairs"]}) == len(ex["pairs"])
    elif kind == "type_answer":
        assert ex["answers"]


def seed_course(db: Session) -> Course:
    course = Course(code=COURSE["code"], title=COURSE["title"], from_language=COURSE["from_language"])
    for u_index, unit_data in enumerate(COURSE["units"]):
        unit = Unit(
            position=u_index,
            title=unit_data["title"],
            description=unit_data["description"],
            color=unit_data["color"],
        )
        for s_index, skill_data in enumerate(unit_data["skills"]):
            skill = Skill(position=s_index, title=skill_data["title"], icon=skill_data["icon"])
            for l_index, lesson_data in enumerate(skill_data["lessons"]):
                lesson = Lesson(position=l_index)
                for e_index, ex in enumerate(lesson_data["exercises"]):
                    _validate_exercise(ex)
                    content = {k: v for k, v in ex.items() if k not in ("type", "prompt")}
                    lesson.exercises.append(
                        Exercise(position=e_index, type=ex["type"], prompt=ex["prompt"], content=content)
                    )
                skill.lessons.append(lesson)
            unit.skills.append(skill)
        course.units.append(unit)
    db.add(course)
    return course


def seed_achievements(db: Session) -> None:
    for code, title, description, icon, metric, threshold in ACHIEVEMENTS:
        db.add(Achievement(code=code, title=title, description=description, icon=icon,
                           metric=metric, threshold=threshold))


def _new_user(username: str, display_name: str, color: str, now: datetime, **kwargs) -> User:
    return User(
        username=username,
        display_name=display_name,
        avatar_color=color,
        timezone=settings.default_timezone,
        hearts_updated_at=now,
        created_at=now - timedelta(days=30),
        **kwargs,
    )


def seed_peers(db: Session, now: datetime, today: date) -> None:
    rng = random.Random(42)
    week_start = today - timedelta(days=today.weekday())
    days_this_week = (today - week_start).days + 1
    for username, name, color, weekly_xp in PEERS:
        peer = _new_user(username, name, color, now, is_demo_peer=True, xp_total=weekly_xp + rng.randint(200, 3000))
        db.add(peer)
        db.flush()
        # Spread this week's XP across the days that have elapsed so far.
        remaining = weekly_xp
        for offset in range(days_this_week):
            day = week_start + timedelta(days=offset)
            amount = remaining if offset == days_this_week - 1 else rng.randint(0, remaining)
            remaining -= amount
            if amount:
                db.add(XpEvent(user_id=peer.id, amount=amount, source="seed", activity_date=day, created_at=now))


def seed_learner(db: Session, course: Course, now: datetime, today: date) -> User:
    """A learner mid-way through Unit 1 with a streak that can be extended today."""
    learner = _new_user(
        settings.default_username, "Alex", "green", now,
        gems=500, hearts=4, daily_goal_xp=20,
        streak_count=LEARNER_STREAK_DAYS, longest_streak=LEARNER_STREAK_DAYS,
        last_streak_date=today - timedelta(days=1),
    )
    db.add(learner)
    db.flush()

    skills = [skill for unit in course.units for skill in unit.skills]
    completed_lessons = [
        (skill, lesson)
        for skill, done in zip(skills, LEARNER_SKILL_PROGRESS)
        for lesson in skill.lessons[:done]
    ]
    for skill, done in zip(skills, LEARNER_SKILL_PROGRESS):
        db.add(UserSkillProgress(
            user_id=learner.id, skill_id=skill.id, lessons_completed=done,
            completed_at=now - timedelta(days=2) if done >= len(skill.lessons) else None,
        ))

    # One or two lessons per day over the streak, oldest first.
    streak_days = [today - timedelta(days=LEARNER_STREAK_DAYS - i) for i in range(LEARNER_STREAK_DAYS)]
    for index, (_skill, lesson) in enumerate(completed_lessons):
        day = streak_days[min(index, len(streak_days) - 1)]
        mistakes = 0 if index % 2 == 0 else 2
        xp = game.LESSON_XP + (game.PERFECT_LESSON_BONUS_XP if mistakes == 0 else 0)
        finished = datetime.combine(day, datetime.min.time()) + timedelta(hours=18)
        db.add(LessonAttempt(
            id=str(uuid.uuid4()), user_id=learner.id, lesson_id=lesson.id, kind="lesson",
            exercise_ids=[e.id for e in lesson.exercises], correct_ids=[e.id for e in lesson.exercises],
            mistakes=mistakes, status="completed", xp_awarded=xp,
            started_at=finished - timedelta(minutes=4), finished_at=finished,
        ))
        game.award_xp(db, learner, xp, "lesson", day, finished)

    # Days of the streak without a seeded lesson still need activity to be consistent.
    covered = {streak_days[min(i, len(streak_days) - 1)] for i in range(len(completed_lessons))}
    for day in streak_days:
        if day not in covered:
            game.award_xp(db, learner, 10, "practice", day, now)

    learner.xp_total += 180  # XP from before the seeded history window
    db.flush()
    game.unlock_achievements(db, learner, now)
    return learner


def seed_database(db: Session) -> None:
    now = clock.utcnow(db)
    today = clock.local_date(now, settings.default_timezone)
    course = seed_course(db)
    seed_achievements(db)
    db.flush()
    seed_learner(db, course, now, today)
    seed_peers(db, now, today)
    db.commit()
    logger.info("Database seeded")


def seed_if_empty(db: Session) -> bool:
    if db.scalar(select(Course.id)) is not None:
        return False
    seed_database(db)
    return True


def reset_database(db: Session) -> None:
    bind = db.get_bind()
    db.close()
    Base.metadata.drop_all(bind)
    Base.metadata.create_all(bind)
    seed_database(db)
