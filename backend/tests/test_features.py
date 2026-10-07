"""Legendary challenges, daily quests and streak freezes."""

from datetime import timedelta

from tests.test_api import active_skill, answer, correct_answer, wrong_answer


def completed_skill_id(client):
    units = client.get("/api/course").json()["units"]
    return next(s["id"] for u in units for s in u["skills"] if s["status"] == "completed")


def start_legendary(client, skill_id):
    return client.post(f"/api/skills/{skill_id}/legendary")


# --------------------------------------------------------------------------- legendary


def test_legendary_requires_a_completed_skill(client):
    res = start_legendary(client, active_skill(client)["id"])
    assert res.status_code == 403 and res.json()["error"]["code"] == "skill_not_completed"


def test_legendary_success_turns_skill_gold(client, db):
    skill_id = completed_skill_id(client)
    attempt = start_legendary(client, skill_id).json()
    assert attempt["kind"] == "legendary" and attempt["time_limit_seconds"] == 180
    assert attempt["max_mistakes"] == 3 and not attempt["hearts_enabled"]
    assert len(attempt["exercises"]) == 10
    hearts_before = client.get("/api/me").json()["hearts"]

    first = attempt["exercises"][0]["id"]
    res = answer(client, attempt["attempt_id"], first, wrong_answer(db, first)).json()
    assert res["attempt_status"] == "in_progress" and res["hearts"] == hearts_before  # no heart cost
    for ex in attempt["exercises"]:
        answer(client, attempt["attempt_id"], ex["id"], correct_answer(db, ex["id"]))

    result = client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()
    assert result["legendary"] and result["xp_earned"] == 40
    skill = next(s for u in client.get("/api/course").json()["units"] for s in u["skills"] if s["id"] == skill_id)
    assert skill["legendary"]
    assert start_legendary(client, skill_id).json()["error"]["code"] == "already_legendary"


def test_legendary_fails_on_third_mistake(client, db):
    attempt = start_legendary(client, completed_skill_id(client)).json()
    ex_id = attempt["exercises"][0]["id"]
    statuses = [
        answer(client, attempt["attempt_id"], ex_id, wrong_answer(db, ex_id)).json()["attempt_status"]
        for _ in range(3)
    ]
    assert statuses == ["in_progress", "in_progress", "failed"]
    after = answer(client, attempt["attempt_id"], ex_id, correct_answer(db, ex_id))
    assert after.status_code == 409 and after.json()["error"]["code"] == "attempt_finished"
    assert client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()["error"]["code"] == "attempt_failed"


def test_legendary_time_limit_is_enforced_by_the_server(client, db, fake_clock):
    attempt = start_legendary(client, completed_skill_id(client)).json()
    ex_id = attempt["exercises"][0]["id"]
    fake_clock.now += timedelta(minutes=4)
    res = answer(client, attempt["attempt_id"], ex_id, correct_answer(db, ex_id))
    assert res.status_code == 409 and res.json()["error"]["code"] == "time_up"
    # The failure was persisted, so later requests see a finished attempt.
    again = answer(client, attempt["attempt_id"], ex_id, correct_answer(db, ex_id))
    assert again.json()["error"]["code"] == "attempt_finished"


# --------------------------------------------------------------------------- quests


def finish_perfect_lesson(client, db):
    attempt = client.post(f"/api/lessons/{active_skill(client)['next_lesson_id']}/attempts").json()
    for ex in attempt["exercises"]:
        answer(client, attempt["attempt_id"], ex["id"], correct_answer(db, ex["id"]))
    return client.post(f"/api/attempts/{attempt['attempt_id']}/complete").json()


def test_daily_quests_track_progress_and_pay_out_once(client, db):
    quests = {q["code"]: q for q in client.get("/api/quests").json()["quests"]}
    assert set(quests) == {"earn_xp", "complete_lessons", "perfect_lesson"}
    assert not any(q["completed"] for q in quests.values())
    assert client.post("/api/quests/perfect_lesson/claim").json()["error"]["code"] == "quest_incomplete"

    finish_perfect_lesson(client, db)
    quests = {q["code"]: q for q in client.get("/api/quests").json()["quests"]}
    assert quests["perfect_lesson"]["completed"] and quests["complete_lessons"]["progress"] == 1

    gems_before = client.get("/api/me").json()["gems"]
    claimed = client.post("/api/quests/perfect_lesson/claim").json()
    assert claimed["gems"] == gems_before + 15
    assert next(q for q in claimed["quests"] if q["code"] == "perfect_lesson")["claimed"]
    assert client.post("/api/quests/perfect_lesson/claim").json()["error"]["code"] == "already_claimed"
    assert client.post("/api/quests/nope/claim").status_code == 404


def test_quests_reset_the_next_day(client, db):
    finish_perfect_lesson(client, db)
    client.post("/api/quests/perfect_lesson/claim")
    client.post("/api/dev/advance-day", json={"days": 1})
    quests = client.get("/api/quests").json()["quests"]
    assert not any(q["completed"] or q["claimed"] for q in quests)


# --------------------------------------------------------------------------- streak freeze


def test_streak_freeze_purchase_and_protection(client):
    me = client.get("/api/me").json()
    assert me["streak_freezes"] == 1 and me["streak"] == 4
    bought = client.post("/api/shop/streak-freeze").json()
    assert bought["streak_freezes"] == 2 and bought["gems"] == me["gems"] - 200
    assert client.post("/api/shop/streak-freeze").json()["error"]["code"] == "freezes_full"

    # Seeded learner last practised yesterday; skipping two more days needs two freezes.
    client.post("/api/dev/advance-day", json={"days": 2})
    assert client.get("/api/me").json()["streak"] == 4
