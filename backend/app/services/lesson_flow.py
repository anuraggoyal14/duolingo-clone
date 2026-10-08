"""The lesson loop: start an attempt -> answer exercises -> complete and get rewarded.

Three kinds of attempt share this flow:
- lesson:    the next lesson of an unlocked skill; wrong answers cost hearts.
- practice:  review of completed lessons; never costs hearts, restores one on completion.
- legendary: a timed challenge on a completed skill; no hearts, but the run fails after
             LEGENDARY_MAX_MISTAKES mistakes or when the time limit passes. Success turns the
             skill gold.

Every state change is validated server-side, so a client can't skip exercises, skip a locked
skill, beat the clock or claim XP twice.
"""

import random
import uuid
from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.errors import AppError, NotFound
from app.models import Exercise, Lesson, LessonAttempt, Skill, User, UserSkillProgress
from app.services import gamification as game
from app.services.grading import InvalidAnswer, grade
from app.services.payments import is_premium
from app.services.progress import skill_state

PRACTICE_SIZE = 8
LEGENDARY_SIZE = 10
LEGENDARY_TIME_LIMIT = timedelta(minutes=3)
LEGENDARY_MAX_MISTAKES = 3  # the third mistake ends the run
LEGENDARY_XP = 40
# Allowance for network latency between the client's timer hitting zero and the request.
DEADLINE_GRACE = timedelta(seconds=5)


def _require_hearts(user: User, now: datetime) -> None:
    if user.hearts <= 0 and not is_premium(user, now):
        raise AppError(403, "out_of_hearts", "You have no hearts left. Refill or practice to earn one.")


def start_lesson(db: Session, user: User, lesson_id: int, now: datetime) -> LessonAttempt:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise NotFound("Lesson")
    state = skill_state(db, user, lesson.skill_id)
    if state.status == "locked" or (
        state.status == "active" and lesson.position > state.lessons_completed
    ):
        raise AppError(403, "lesson_locked", "Complete the previous lessons to unlock this one.")
    _require_hearts(user, now)

    attempt = LessonAttempt(
        id=str(uuid.uuid4()),
        user_id=user.id,
        lesson_id=lesson.id,
        kind="lesson",
        exercise_ids=[e.id for e in lesson.exercises],
        correct_ids=[],
        started_at=now,
    )
    db.add(attempt)
    return attempt


def start_practice(db: Session, user: User, now: datetime) -> LessonAttempt:
    """Practice draws exercises from lessons the learner has already completed. It never
    costs hearts and restores one on completion (the "practice to earn a heart" refill)."""
    completed_lesson_ids = db.scalars(
        select(LessonAttempt.lesson_id)
        .where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.kind == "lesson",
            LessonAttempt.status == "completed",
        )
        .distinct()
    ).all()
    if not completed_lesson_ids:
        raise AppError(409, "nothing_to_practice", "Complete a lesson first to unlock practice.")
    pool = db.scalars(select(Exercise.id).where(Exercise.lesson_id.in_(completed_lesson_ids))).all()
    picked = random.sample(list(pool), k=min(PRACTICE_SIZE, len(pool)))

    attempt = LessonAttempt(
        id=str(uuid.uuid4()),
        user_id=user.id,
        lesson_id=None,
        kind="practice",
        exercise_ids=picked,
        correct_ids=[],
        started_at=now,
    )
    db.add(attempt)
    return attempt


def start_legendary(db: Session, user: User, skill_id: int, now: datetime) -> LessonAttempt:
    """Timed challenge over a completed skill's exercises. Free to start (gems are mocked)."""
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise NotFound("Skill")
    progress = db.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == skill_id
        )
    )
    if progress is None or progress.completed_at is None:
        raise AppError(403, "skill_not_completed", "Complete this skill before going Legendary.")
    if progress.legendary_at is not None:
        raise AppError(409, "already_legendary", "This skill is already Legendary.")

    pool = [e.id for lesson in skill.lessons for e in lesson.exercises]
    attempt = LessonAttempt(
        id=str(uuid.uuid4()),
        user_id=user.id,
        skill_id=skill.id,
        kind="legendary",
        exercise_ids=random.sample(pool, k=min(LEGENDARY_SIZE, len(pool))),
        correct_ids=[],
        started_at=now,
        deadline_at=now + LEGENDARY_TIME_LIMIT,
    )
    db.add(attempt)
    return attempt


def _fail(attempt: LessonAttempt, now: datetime) -> None:
    attempt.status = "failed"
    attempt.finished_at = now


def _check_deadline(db: Session, attempt: LessonAttempt, now: datetime) -> None:
    if attempt.deadline_at is not None and now > attempt.deadline_at + DEADLINE_GRACE:
        _fail(attempt, now)
        db.commit()  # persist the failure even though the request ends with an error
        raise AppError(409, "time_up", "Time's up! The challenge has ended.")


def attempt_exercises(db: Session, attempt: LessonAttempt) -> list[Exercise]:
    by_id = {e.id: e for e in db.scalars(select(Exercise).where(Exercise.id.in_(attempt.exercise_ids)))}
    return [by_id[i] for i in attempt.exercise_ids if i in by_id]


def get_attempt(db: Session, user: User, attempt_id: str) -> LessonAttempt:
    attempt = db.get(LessonAttempt, attempt_id)
    if attempt is None or attempt.user_id != user.id:
        raise NotFound("Attempt")
    return attempt


def submit_answer(
    db: Session, user: User, attempt: LessonAttempt, exercise_id: int, answer: Any, now: datetime
) -> dict[str, Any]:
    if attempt.status != "in_progress":
        raise AppError(409, "attempt_finished", "This lesson is already finished.")
    _check_deadline(db, attempt, now)
    if exercise_id not in attempt.exercise_ids:
        raise AppError(400, "exercise_not_in_attempt", "This exercise is not part of the lesson.")
    exercise = db.get(Exercise, exercise_id)
    already_correct = exercise_id in attempt.correct_ids
    if attempt.kind == "lesson" and not already_correct:
        _require_hearts(user, now)

    try:
        result = grade(exercise, answer)
    except InvalidAnswer as exc:
        raise AppError(422, "invalid_answer", str(exc)) from exc

    # Re-submitting an exercise that was already answered correctly (e.g. a double click)
    # has no side effects.
    if not already_correct:
        if result.correct:
            attempt.correct_ids = [*attempt.correct_ids, exercise_id]  # reassign so JSON is flagged dirty
        else:
            attempt.mistakes += 1
            if attempt.kind == "lesson" and not is_premium(user, now):
                game.lose_heart(user, now)  # Premium learners have unlimited hearts
            elif attempt.kind == "legendary" and attempt.mistakes >= LEGENDARY_MAX_MISTAKES:
                _fail(attempt, now)

    return {
        "correct": result.correct,
        "solution": result.solution,
        "note": result.note,
        "hearts": user.hearts,
        "remaining": len(set(attempt.exercise_ids) - set(attempt.correct_ids)),
        "attempt_status": attempt.status,
    }


def complete_attempt(
    db: Session, user: User, attempt: LessonAttempt, now: datetime, today: date
) -> dict[str, Any]:
    if attempt.status == "completed":
        return attempt.result  # idempotent: rewards are only granted once
    if attempt.status == "failed":
        raise AppError(409, "attempt_failed", "This challenge has ended. Try again!")
    _check_deadline(db, attempt, now)
    missing = set(attempt.exercise_ids) - set(attempt.correct_ids)
    if missing:
        raise AppError(409, "lesson_incomplete", f"{len(missing)} exercise(s) still need a correct answer.")

    # Claim the attempt atomically so two concurrent requests can't both award rewards:
    # only the request whose conditional UPDATE matches the row proceeds.
    claimed = db.execute(
        update(LessonAttempt)
        .where(LessonAttempt.id == attempt.id, LessonAttempt.status == "in_progress")
        .values(status="completed")
        .execution_options(synchronize_session=False)
    ).rowcount
    if claimed != 1:
        db.rollback()
        db.refresh(attempt)
        if attempt.result is None:
            raise AppError(409, "completion_in_progress", "This lesson is already being completed.")
        return attempt.result

    xp_before_today = game.xp_on(db, user.id, today)
    total = len(attempt.exercise_ids)
    perfect = attempt.mistakes == 0

    if attempt.kind == "practice":
        base_xp, bonus_xp = game.PRACTICE_XP, 0
        game.gain_heart(user, now)
    elif attempt.kind == "legendary":
        base_xp, bonus_xp = LEGENDARY_XP, 0
    else:
        base_xp = game.LESSON_XP
        bonus_xp = game.PERFECT_LESSON_BONUS_XP if perfect else 0

    xp_earned = base_xp + bonus_xp
    game.award_xp(db, user, xp_earned, attempt.kind, today, now)
    streak_extended, freezes_used = game.register_activity(user, today)

    skill_completed, skill_title, gems_earned = False, None, 0
    if attempt.kind == "lesson":
        skill_completed, skill_title, gems_earned = _advance_skill(db, user, attempt, now)
    elif attempt.kind == "legendary":
        skill_title = _make_legendary(db, user, attempt, now)

    attempt.status = "completed"
    attempt.finished_at = now
    attempt.xp_awarded = xp_earned
    new_achievements = game.unlock_achievements(db, user, now)

    daily_xp = xp_before_today + xp_earned
    attempt.result = {
        "kind": attempt.kind,
        "xp_earned": xp_earned,
        "base_xp": base_xp,
        "bonus_xp": bonus_xp,
        "mistakes": attempt.mistakes,
        "accuracy": round(100 * total / (total + attempt.mistakes)),
        "perfect": perfect,
        "streak": user.streak_count,
        "streak_extended": streak_extended,
        "streak_freezes_used": freezes_used,
        "daily_xp": daily_xp,
        "daily_goal_xp": user.daily_goal_xp,
        "daily_goal_reached_now": xp_before_today < user.daily_goal_xp <= daily_xp,
        "skill_completed": skill_completed,
        "legendary": attempt.kind == "legendary",
        "skill_title": skill_title,
        "gems_earned": gems_earned,
        "hearts": user.hearts,
        "new_achievements": [
            {"code": a.code, "title": a.title, "description": a.description, "icon": a.icon}
            for a in new_achievements
        ],
    }
    return attempt.result


def _advance_skill(
    db: Session, user: User, attempt: LessonAttempt, now: datetime
) -> tuple[bool, str | None, int]:
    """Advance skill progress if this was the next new lesson (replays don't count twice)."""
    lesson = attempt.lesson
    skill = lesson.skill
    progress = db.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == skill.id
        )
    )
    if progress is None:
        progress = UserSkillProgress(user_id=user.id, skill_id=skill.id, lessons_completed=0)
        db.add(progress)

    if lesson.position != progress.lessons_completed:
        return False, skill.title, 0

    progress.lessons_completed += 1
    if progress.lessons_completed >= len(skill.lessons) and progress.completed_at is None:
        progress.completed_at = now
        user.gems += game.SKILL_COMPLETE_GEMS
        return True, skill.title, game.SKILL_COMPLETE_GEMS
    return False, skill.title, 0


def _make_legendary(db: Session, user: User, attempt: LessonAttempt, now: datetime) -> str:
    progress = db.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == attempt.skill_id
        )
    )
    progress.legendary_at = now
    return attempt.skill.title
