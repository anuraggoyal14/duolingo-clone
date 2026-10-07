from fastapi import APIRouter, Depends

from app.deps import RequestContext, get_context
from app.schemas import QuestOut, QuestsOut
from app.services.quests import Quest, claim_quest, daily_quests

router = APIRouter(tags=["quests"])


def _quests_out(ctx: RequestContext, quests: list[Quest]) -> QuestsOut:
    return QuestsOut(
        quests=[
            QuestOut(
                code=q.code, title=q.title, progress=q.progress, target=q.target,
                completed=q.completed, claimed=q.claimed, reward_gems=q.reward_gems,
            )
            for q in quests
        ],
        gems=ctx.user.gems,
    )


@router.get("/quests", response_model=QuestsOut)
def get_quests(ctx: RequestContext = Depends(get_context)):
    """Today's daily quests (they reset at the learner's local midnight)."""
    return _quests_out(ctx, daily_quests(ctx.db, ctx.user, ctx.today))


@router.post("/quests/{code}/claim", response_model=QuestsOut)
def claim(code: str, ctx: RequestContext = Depends(get_context)):
    """Open a completed quest's chest for gems (once per quest per day)."""
    claim_quest(ctx.db, ctx.user, code, ctx.today, ctx.now)
    ctx.db.commit()
    return _quests_out(ctx, daily_quests(ctx.db, ctx.user, ctx.today))
