"""API-level tests that exercise the full lesson loop against a freshly seeded database."""

from datetime import timedelta

from sqlalchemy import func, select

from app.database import SessionLocal
from app.models import Exercise, LessonAttempt, Skill, User, XpEvent
from app.services import lesson_flow
from app.services.grading import grade
from tests.conftest import FIXED_NOW


def correct_answer(db, exercise_id: int):
    ex = db.get(Exercise, exercise_id)
    c = ex.content
    return {
        "multiple_choice": lambda: c["answer"],
        "translate": lambda: c["answers"][0].split(),
        "fill_blank": lambda: c["answer"],
        "type_answer": lambda: c["answers"][0],
        "match_pairs": lambda: c["pairs"],
    }[ex.type]()


def wrong_answer(db, exercise_id: int):
    ex = db.get(Exercise, exercise_id)
    c = ex.content
    return {
        "multiple_choice": lambda: (c["answer"] + 1) % len(c["choices"]),
        "translate": lambda: ["nope"],
        "fill_blank": lambda: next(x for x in c["choices"] if x != c["answer"]),
        "type_answer": lambda: "zzzzzz",
        "match_pairs": lambda: [[c["pairs"][0][0], c["pairs"][1][1]]],
    }[ex.type]()


def active_skill(client):
    units = client.get("/api/course").json()["units"]
    return next(s for u in units for s in u["skills"] if s["status"] == "active")


def answer(client, attempt_id, exercise_id, value):
    return client.post(f"/api/attempts/{attempt_id}/answers", json={"exercise_id": exercise_id, "answer": value})


def test_seeded_state_is_usable(client):
    me = client.get("/api/me").json()
    assert me["streak"] == 4 and not me["streak_extended_today"]
    assert me["hearts"] == 4 and me["gems"] == 500

    units = client.get("/api/course").json()["units"]
    statuses = [s["status"] for u in units for s in u["skills"]]
    assert statuses[:3] == ["completed", "completed", "active"]
    assert set(statuses[3:]) == {"locked"}


def test_answer_keys_are_not_exposed(client):
    attempt = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()
    for ex in attempt["exercises"]:
        assert "answer" not in ex and "answers" not in ex


def test_full_lesson_awards_xp_streak_and_progress_once(client, db):
    skill = active_skill(client)
    me_before = client.get("/api/me").json()
    attempt = client.post(f"/api/lessons/{skill['next_lesson_id']}/attempts").json()
    ids = [e["id"] for e in attempt["exercises"]]

    # Completing early is rejected.
    assert client.post(f"/api/attempts/{attempt['attempt_id']}/complete").status_code == 409

    for exercise_id in ids:
        res = answer(client, attempt["attempt_id"], exercise_id, correct_answer(db, exercise_id)).json()
        assert res["correct"], exercise_id

    result = client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()
    assert result["xp_earned"] == 15 and result["perfect"]  # 10 + perfect bonus
    assert result["streak_extended"] and result["streak"] == 5
    assert result["skill_completed"] and result["gems_earned"] == 20

    # Completing again is idempotent: no double XP.
    again = client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()
    assert again == result
    me_after = client.get("/api/me").json()
    assert me_after["xp_total"] == me_before["xp_total"] + 15
    assert me_after["daily_xp"] == 15 and me_after["streak_extended_today"]

    # The next skill unlocks.
    units = client.get("/api/course").json()["units"]
    statuses = [s["status"] for u in units for s in u["skills"]]
    assert statuses[:4] == ["completed", "completed", "completed", "active"]


def test_wrong_answers_cost_hearts_and_block_at_zero(client, db):
    attempt = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()
    exercise_id = attempt["exercises"][0]["id"]
    hearts = attempt["hearts"]
    for expected in range(hearts - 1, -1, -1):
        res = answer(client, attempt["attempt_id"], exercise_id, wrong_answer(db, exercise_id)).json()
        assert not res["correct"] and res["hearts"] == expected

    blocked = answer(client, attempt["attempt_id"], exercise_id, correct_answer(db, exercise_id))
    assert blocked.status_code == 403 and blocked.json()["error"]["code"] == "out_of_hearts"
    start = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts")
    assert start.json()["error"]["code"] == "out_of_hearts"

    # Refill with (mock) gems restores hearts and lets the learner continue.
    refill = client.post("/api/shop/refill-hearts").json()
    assert refill["hearts"] == 5 and refill["gems"] == 150
    assert answer(client, attempt["attempt_id"], exercise_id, correct_answer(db, exercise_id)).json()["correct"]


def test_hearts_regenerate_over_time(client, db, fake_clock):
    attempt = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()
    exercise_id = attempt["exercises"][0]["id"]
    answer(client, attempt["attempt_id"], exercise_id, wrong_answer(db, exercise_id))
    assert client.get("/api/me").json()["hearts"] == 3
    fake_clock.now += timedelta(hours=3)
    assert client.get("/api/me").json()["hearts"] == 5


def test_locked_lessons_cannot_be_started(client, db):
    units = client.get("/api/course").json()["units"]
    locked = next(s for u in units for s in u["skills"] if s["status"] == "locked")
    assert locked["next_lesson_id"] is None
    lesson_id = db.get(Skill, locked["id"]).lessons[0].id
    res = client.post(f"/api/lessons/{lesson_id}/attempts")
    assert res.status_code == 403 and res.json()["error"]["code"] == "lesson_locked"


def test_practice_restores_a_heart_without_costing_hearts(client, db):
    attempt = client.post("/api/practice/attempts").json()
    assert attempt["kind"] == "practice" and not attempt["hearts_enabled"]
    first = attempt["exercises"][0]["id"]
    res = answer(client, attempt["attempt_id"], first, wrong_answer(db, first)).json()
    assert res["hearts"] == 4  # unchanged
    for ex in attempt["exercises"]:
        answer(client, attempt["attempt_id"], ex["id"], correct_answer(db, ex["id"]))
    result = client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()
    assert result["hearts"] == 5 and result["xp_earned"] == 10


def test_streak_breaks_after_missed_day_via_time_travel(client):
    assert client.get("/api/me").json()["streak"] == 4
    client.post("/api/dev/advance-day", json={"days": 2})
    assert client.get("/api/me").json()["streak"] == 0


def test_leaderboard_and_profile(client):
    board = client.get("/api/leaderboard").json()
    xps = [e["weekly_xp"] for e in board["entries"]]
    assert xps == sorted(xps, reverse=True)
    assert sum(e["is_current_user"] for e in board["entries"]) == 1

    profile = client.get("/api/profile").json()
    assert profile["lessons_completed"] == 5
    assert len(profile["xp_last_7_days"]) == 7
    assert any(a["unlocked_at"] for a in profile["achievements"])


def test_validation_errors(client):
    assert client.patch("/api/me", json={"daily_goal_xp": 7}).status_code == 422
    assert client.patch("/api/me", json={"timezone": "Mars/Base"}).status_code == 422
    assert client.patch("/api/me", json={"daily_goal_xp": 30}).json()["daily_goal_xp"] == 30
    assert client.post("/api/lessons/99999/attempts").status_code == 404
    bad = client.post("/api/lessons/abc/attempts")
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "validation_error"
    assert client.post("/api/attempts/nope/answers", json={"exercise_id": 1, "answer": 0}).status_code == 404


def test_every_seeded_exercise_accepts_its_canonical_answer(client, db):
    exercises = db.scalars(select(Exercise)).all()
    assert len(exercises) >= 100
    for ex in exercises:
        assert grade(ex, correct_answer(db, ex.id)).correct, (ex.id, ex.prompt)
        assert not grade(ex, wrong_answer(db, ex.id)).correct, (ex.id, ex.prompt)


def test_concurrent_completion_awards_rewards_once(client, db):
    """Two sessions holding the same in-progress attempt: only the first completion counts."""
    attempt_id = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()["attempt_id"]
    for ex_id in db.get(LessonAttempt, attempt_id).exercise_ids:
        answer(client, attempt_id, ex_id, correct_answer(db, ex_id))
    xp_before = client.get("/api/me").json()["xp_total"]
    events_before = db.scalar(select(func.count()).select_from(XpEvent))

    first, second = SessionLocal(), SessionLocal()
    try:
        # Both requests load the attempt while it is still in progress...
        a1, a2 = first.get(LessonAttempt, attempt_id), second.get(LessonAttempt, attempt_id)
        u1, u2 = first.get(User, a1.user_id), second.get(User, a2.user_id)
        now, today = FIXED_NOW, FIXED_NOW.date()
        result1 = lesson_flow.complete_attempt(first, u1, a1, now, today)
        first.commit()
        # ...but the second one must lose the atomic claim and return the cached result.
        result2 = lesson_flow.complete_attempt(second, u2, a2, now, today)
        second.commit()
    finally:
        first.close()
        second.close()

    assert result1 == result2
    assert client.get("/api/me").json()["xp_total"] == xp_before + result1["xp_earned"]
    db.expire_all()
    assert db.scalar(select(func.count()).select_from(XpEvent)) == events_before + 1
