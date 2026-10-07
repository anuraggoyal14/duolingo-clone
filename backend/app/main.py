import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.errors import AppError, app_error_handler, validation_error_handler
from app.routers import course, dev, leaderboard, lessons, me, quests, shop
from app.seed.seeder import seed_if_empty

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


app = FastAPI(title="Duolingo Clone API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)

for router in (
    me.router, course.router, lessons.router, leaderboard.router, quests.router, shop.router, dev.router
):
    app.include_router(router, prefix="/api")


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}
