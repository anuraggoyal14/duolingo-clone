"""Learning-path state: which skills are completed, active (next up) or locked.

The path is strictly linear across units: a skill unlocks once every skill before it is
completed. Completed skills stay replayable.
"""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.errors import NotFound
from app.models import Course, Skill, Unit, User, UserSkillProgress


@dataclass
class SkillState:
    skill: Skill
    status: str  # completed | active | locked
    lessons_completed: int
    total_lessons: int

    @property
    def next_lesson_id(self) -> int | None:
        lessons = self.skill.lessons
        if not lessons or self.status == "locked":
            return None
        if self.lessons_completed >= len(lessons):  # completed: replay the first lesson
            return lessons[0].id
        return lessons[self.lessons_completed].id


def load_course(db: Session) -> Course:
    course = db.scalar(
        select(Course).options(
            selectinload(Course.units).selectinload(Unit.skills).selectinload(Skill.lessons)
        )
    )
    if course is None:
        raise NotFound("Course")
    return course


def progress_by_skill(db: Session, user: User) -> dict[int, UserSkillProgress]:
    rows = db.scalars(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))
    return {row.skill_id: row for row in rows}


def compute_path(db: Session, user: User, course: Course) -> list[SkillState]:
    progress = progress_by_skill(db, user)
    states: list[SkillState] = []
    previous_completed = True
    for unit in course.units:
        for skill in unit.skills:
            done = progress[skill.id].lessons_completed if skill.id in progress else 0
            total = len(skill.lessons)
            if done >= total:
                status = "completed"
            elif previous_completed:
                status = "active"
            else:
                status = "locked"
            previous_completed = status == "completed"
            states.append(SkillState(skill, status, min(done, total), total))
    return states


def skill_state(db: Session, user: User, skill_id: int) -> SkillState:
    for state in compute_path(db, user, load_course(db)):
        if state.skill.id == skill_id:
            return state
    raise NotFound("Skill")
