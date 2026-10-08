"""Content manager: browse the whole course (answer keys included) and edit its text.

Shares the ENABLE_DEV_TOOLS switch with /api/dev. There is no real auth yet (see deps.py),
so anyone who can reach these endpoints can rewrite the course.
"""

from collections import Counter
from collections.abc import Callable
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.database import get_db
from app.errors import AppError, NotFound
from app.models import EXERCISE_TYPES, Course, Exercise, Lesson, Skill, Unit
from app.schemas import (
    AdminContentOut,
    AdminCourseOut,
    AdminExerciseOut,
    AdminExerciseUpdate,
    AdminSkillOut,
    AdminSkillUpdate,
    AdminTotals,
    AdminUnitOut,
    AdminUnitUpdate,
)
from app.seed.seeder import _validate_exercise


def _require_dev_tools() -> None:
    if not settings.enable_dev_tools:
        raise AppError(404, "not_found", "Not found")


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(_require_dev_tools)])


# --------------------------------------------------------------------------- validation


def _is_text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _is_text_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_is_text(item) for item in value)


def _is_choice_list(value: Any) -> bool:
    return isinstance(value, list) and len(value) >= 2 and all(
        isinstance(choice, dict) and _is_text(choice.get("text")) for choice in value
    )


def _is_pair_list(value: Any) -> bool:
    return isinstance(value, list) and len(value) >= 2 and all(
        isinstance(pair, list) and len(pair) == 2 and all(_is_text(side) for side in pair) for pair in value
    )


def _is_index(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


# Fields the lesson player and grader read, per type: field -> (check, what it should be).
# The seeder's `_validate_exercise` only asserts cross-field rules on trusted seed data, so
# shape problems (e.g. `"answer": "1"` or an empty `answers` list) are caught here first.
_FIELDS: dict[str, dict[str, tuple[Callable[[Any], bool], str]]] = {
    "multiple_choice": {
        "choices": (_is_choice_list, 'a list of at least 2 {"text": ...} objects'),
        "answer": (_is_index, "the 0-based index of the correct choice"),
    },
    "translate": {
        "source": (_is_text, "the sentence to translate"),
        "source_lang": (_is_text, 'a language code such as "en"'),
        "word_bank": (_is_text_list, "a non-empty list of words"),
        "answers": (_is_text_list, "a non-empty list of accepted translations"),
    },
    "match_pairs": {
        "pairs": (_is_pair_list, "a list of at least 2 [left, right] pairs"),
    },
    "fill_blank": {
        "sentence": (_is_text, "the sentence, with ___ marking the blank"),
        "translation": (_is_text, "the translation of the sentence"),
        "choices": (_is_text_list, "a non-empty list of words"),
        "answer": (_is_text, "the word that fills the blank"),
    },
    "type_answer": {
        "source": (_is_text, "the text to translate"),
        "source_lang": (_is_text, 'a language code such as "en"'),
        "answers": (_is_text_list, "a non-empty list of accepted answers"),
    },
}

# Explanations for the seeder's bare `assert`s, which carry no message of their own.
_RULE_HINTS = {
    "multiple_choice": "answer must be the index of one of the choices (0-based)",
    "translate": "every word of the first answer must appear in the word bank",
    "fill_blank": "sentence must contain exactly one ___ and answer must be one of the choices",
    "match_pairs": "the left-hand words must be unique",
    "type_answer": "answers must not be empty",
}

# `type` and `prompt` live in their own columns; `id` would clobber the id in public payloads.
_RESERVED_KEYS = {"id", "type", "prompt"}


def _invalid(kind: str, detail: str) -> AppError:
    return AppError(422, "invalid_exercise", f"Invalid {kind} exercise: {detail}")


def _check_exercise(kind: str, prompt: str, content: dict[str, Any]) -> None:
    """Raise 422 `invalid_exercise` unless the payload is one learners can actually play."""
    reserved = sorted(_RESERVED_KEYS & content.keys())
    if reserved:
        raise _invalid(kind, f"content must not contain {', '.join(reserved)} (the type cannot change)")
    for field, (is_valid, expected) in _FIELDS[kind].items():
        if field not in content:
            raise _invalid(kind, f"missing '{field}' ({expected})")
        if not is_valid(content[field]):
            raise _invalid(kind, f"'{field}' must be {expected}")
    try:
        _validate_exercise({"type": kind, "prompt": prompt, **content})
    except AssertionError as exc:
        raise _invalid(kind, str(exc) or _RULE_HINTS[kind]) from None
    except (KeyError, TypeError, IndexError, ValueError) as exc:
        raise _invalid(kind, f"malformed content ({type(exc).__name__}: {exc})") from None


# --------------------------------------------------------------------------- endpoints


@router.get("/content", response_model=AdminContentOut)
def get_content(db: Session = Depends(get_db)):
    """The full course tree with every exercise's answer key, plus content totals."""
    course = db.scalar(
        select(Course).options(
            selectinload(Course.units)
            .selectinload(Unit.skills)
            .selectinload(Skill.lessons)
            .selectinload(Lesson.exercises)
        )
    )
    if course is None:
        raise NotFound("Course")

    skills = [skill for unit in course.units for skill in unit.skills]
    lessons = [lesson for skill in skills for lesson in skill.lessons]
    type_counts = Counter(ex.type for lesson in lessons for ex in lesson.exercises)
    return AdminContentOut(
        course=AdminCourseOut(code=course.code, title=course.title),
        units=[AdminUnitOut.model_validate(unit, from_attributes=True) for unit in course.units],
        totals=AdminTotals(
            units=len(course.units),
            skills=len(skills),
            lessons=len(lessons),
            exercises=sum(type_counts.values()),
            by_type={kind: type_counts[kind] for kind in EXERCISE_TYPES},
        ),
    )


@router.patch("/units/{unit_id}", response_model=AdminUnitOut)
def update_unit(unit_id: int, body: AdminUnitUpdate, db: Session = Depends(get_db)):
    unit = db.get(Unit, unit_id)
    if unit is None:
        raise NotFound("Unit")
    if body.title is not None:
        unit.title = body.title
    if body.description is not None:
        unit.description = body.description
    db.commit()
    return AdminUnitOut.model_validate(unit, from_attributes=True)


@router.patch("/skills/{skill_id}", response_model=AdminSkillOut)
def update_skill(skill_id: int, body: AdminSkillUpdate, db: Session = Depends(get_db)):
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise NotFound("Skill")
    if body.title is not None:
        skill.title = body.title
    db.commit()
    return AdminSkillOut.model_validate(skill, from_attributes=True)


@router.patch("/exercises/{exercise_id}", response_model=AdminExerciseOut)
def update_exercise(exercise_id: int, body: AdminExerciseUpdate, db: Session = Depends(get_db)):
    """Edit an exercise's prompt and/or replace its payload. The new version is validated
    with the same rules as the seed content, so learners never get an unplayable exercise."""
    exercise = db.get(Exercise, exercise_id)
    if exercise is None:
        raise NotFound("Exercise")
    prompt = exercise.prompt if body.prompt is None else body.prompt
    content = exercise.content if body.content is None else body.content
    _check_exercise(exercise.type, prompt, content)
    exercise.prompt = prompt
    exercise.content = content
    db.commit()
    return AdminExerciseOut.model_validate(exercise, from_attributes=True)
