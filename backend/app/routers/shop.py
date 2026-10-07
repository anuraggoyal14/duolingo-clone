from fastapi import APIRouter, Depends

from app.deps import RequestContext, get_context
from app.errors import AppError
from app.presenters import build_me
from app.schemas import MeOut
from app.services import gamification as game

router = APIRouter(tags=["shop"])


@router.post("/shop/refill-hearts", response_model=MeOut)
def refill_hearts(ctx: RequestContext = Depends(get_context)):
    """Mocked purchase: spend gems (no real payments) to restore all hearts."""
    user = ctx.user
    if user.hearts >= game.MAX_HEARTS:
        raise AppError(409, "hearts_full", "Your hearts are already full.")
    if user.gems < game.HEART_REFILL_COST_GEMS:
        raise AppError(402, "insufficient_gems", "You don't have enough gems.")
    user.gems -= game.HEART_REFILL_COST_GEMS
    game.refill_hearts(user, ctx.now)
    ctx.db.commit()
    return build_me(ctx)


@router.post("/shop/streak-freeze", response_model=MeOut)
def buy_streak_freeze(ctx: RequestContext = Depends(get_context)):
    """Mocked purchase: equip a streak freeze that protects the streak for one missed day."""
    user = ctx.user
    if user.streak_freezes >= game.MAX_STREAK_FREEZES:
        raise AppError(409, "freezes_full", f"You can equip at most {game.MAX_STREAK_FREEZES} streak freezes.")
    if user.gems < game.STREAK_FREEZE_COST_GEMS:
        raise AppError(402, "insufficient_gems", "You don't have enough gems.")
    user.gems -= game.STREAK_FREEZE_COST_GEMS
    user.streak_freezes += 1
    ctx.db.commit()
    return build_me(ctx)
