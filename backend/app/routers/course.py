from fastapi import APIRouter, Depends

from app.deps import RequestContext, get_context
from app.presenters import course_info
from app.schemas import CoursePathOut, SkillOut, UnitOut
from app.services.progress import compute_path, load_course

router = APIRouter(tags=["course"])


@router.get("/course", response_model=CoursePathOut)
def get_course_path(ctx: RequestContext = Depends(get_context)):
    """The learning path: units with their skills and the learner's state for each."""
    course = load_course(ctx.db)
    states = {s.skill.id: s for s in compute_path(ctx.db, ctx.user, course)}
    units = [
        UnitOut(
            id=unit.id,
            position=unit.position,
            title=unit.title,
            description=unit.description,
            color=unit.color,
            skills=[
                SkillOut(
                    id=skill.id,
                    title=skill.title,
                    icon=skill.icon,
                    status=states[skill.id].status,
                    lessons_completed=states[skill.id].lessons_completed,
                    total_lessons=states[skill.id].total_lessons,
                    next_lesson_id=states[skill.id].next_lesson_id,
                    legendary=states[skill.id].legendary,
                )
                for skill in unit.skills
            ],
        )
        for unit in course.units
    ]
    return CoursePathOut(course=course_info(course), units=units)
