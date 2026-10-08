from fastapi import APIRouter, Depends

from app.deps import RequestContext, get_context
from app.models import LessonAttempt
from app.schemas import AnswerIn, AnswerOut, AttemptOut, CompletionOut, LessonMeta
from app.services import gamification as game
from app.services import lesson_flow
from app.services.grading import public_payload
from app.services.payments import is_premium

router = APIRouter(tags=["lessons"])


def _attempt_out(ctx: RequestContext, attempt: LessonAttempt) -> AttemptOut:
    lesson = attempt.lesson
    if attempt.kind == "legendary":
        skill = attempt.skill
        meta = LessonMeta(
            lesson_id=None, skill_id=skill.id, skill_title=skill.title,
            unit_title=skill.unit.title, lesson_number=None, lessons_in_skill=None,
        )
    elif lesson is not None:
        skill = lesson.skill
        meta = LessonMeta(
            lesson_id=lesson.id,
            skill_id=skill.id,
            skill_title=skill.title,
            unit_title=skill.unit.title,
            lesson_number=lesson.position + 1,
            lessons_in_skill=len(skill.lessons),
        )
    else:
        meta = LessonMeta(
            lesson_id=None, skill_id=None, skill_title="Practice",
            unit_title=None, lesson_number=None, lessons_in_skill=None,
        )
    return AttemptOut(
        attempt_id=attempt.id,
        kind=attempt.kind,
        meta=meta,
        exercises=[public_payload(e) for e in lesson_flow.attempt_exercises(ctx.db, attempt)],
        hearts=ctx.user.hearts,
        max_hearts=game.MAX_HEARTS,
        hearts_enabled=attempt.kind == "lesson" and not is_premium(ctx.user, ctx.now),
        time_limit_seconds=(
            int((attempt.deadline_at - attempt.started_at).total_seconds()) if attempt.deadline_at else None
        ),
        max_mistakes=lesson_flow.LEGENDARY_MAX_MISTAKES if attempt.kind == "legendary" else None,
    )


@router.post("/lessons/{lesson_id}/attempts", response_model=AttemptOut, status_code=201)
def start_lesson(lesson_id: int, ctx: RequestContext = Depends(get_context)):
    attempt = lesson_flow.start_lesson(ctx.db, ctx.user, lesson_id, ctx.now)
    ctx.db.commit()
    return _attempt_out(ctx, attempt)


@router.post("/practice/attempts", response_model=AttemptOut, status_code=201)
def start_practice(ctx: RequestContext = Depends(get_context)):
    attempt = lesson_flow.start_practice(ctx.db, ctx.user, ctx.now)
    ctx.db.commit()
    return _attempt_out(ctx, attempt)


@router.post("/skills/{skill_id}/legendary", response_model=AttemptOut, status_code=201)
def start_legendary(skill_id: int, ctx: RequestContext = Depends(get_context)):
    """Start a timed Legendary challenge on a completed skill."""
    attempt = lesson_flow.start_legendary(ctx.db, ctx.user, skill_id, ctx.now)
    ctx.db.commit()
    return _attempt_out(ctx, attempt)


@router.post("/attempts/{attempt_id}/answers", response_model=AnswerOut)
def submit_answer(attempt_id: str, body: AnswerIn, ctx: RequestContext = Depends(get_context)):
    attempt = lesson_flow.get_attempt(ctx.db, ctx.user, attempt_id)
    result = lesson_flow.submit_answer(ctx.db, ctx.user, attempt, body.exercise_id, body.answer, ctx.now)
    ctx.db.commit()
    return result


@router.post("/attempts/{attempt_id}/complete", response_model=CompletionOut)
def complete_attempt(attempt_id: str, ctx: RequestContext = Depends(get_context)):
    attempt = lesson_flow.get_attempt(ctx.db, ctx.user, attempt_id)
    result = lesson_flow.complete_attempt(ctx.db, ctx.user, attempt, ctx.now, ctx.today)
    ctx.db.commit()
    return result
