"""Content manager (/api/admin): the course tree with answer keys, and validated edits."""

import pytest

from app.config import settings
from app.models import EXERCISE_TYPES
from tests.test_api import active_skill, answer


def get_tree(client):
    res = client.get("/api/admin/content")
    assert res.status_code == 200
    return res.json()


def all_lessons(tree):
    return [lesson for unit in tree["units"] for skill in unit["skills"] for lesson in skill["lessons"]]


def all_exercises(tree):
    return [ex for lesson in all_lessons(tree) for ex in lesson["exercises"]]


def first_of_type(tree, kind):
    return next(ex for ex in all_exercises(tree) if ex["type"] == kind)


def stored_exercise(client, exercise_id):
    return next(ex for ex in all_exercises(get_tree(client)) if ex["id"] == exercise_id)


def patch_exercise(client, exercise_id, body):
    return client.patch(f"/api/admin/exercises/{exercise_id}", json=body)


# --------------------------------------------------------------------------- reading


def test_content_tree_has_totals_and_answer_keys(client):
    tree = get_tree(client)
    assert tree["course"] == {"code": "es", "title": "Spanish"}

    totals = tree["totals"]
    assert (totals["units"], totals["skills"], totals["lessons"], totals["exercises"]) == (3, 8, 16, 128)
    assert list(totals["by_type"]) == list(EXERCISE_TYPES)
    assert sum(totals["by_type"].values()) == 128 == len(all_exercises(tree))

    # Nodes come back in path order.
    assert [u["position"] for u in tree["units"]] == [0, 1, 2]
    assert all(
        [e["position"] for e in lesson["exercises"]] == list(range(len(lesson["exercises"])))
        for lesson in all_lessons(tree)
    )

    # Unlike lesson attempts, the admin view includes the answer keys.
    assert isinstance(first_of_type(tree, "multiple_choice")["content"]["answer"], int)
    assert first_of_type(tree, "translate")["content"]["answers"]
    assert first_of_type(tree, "fill_blank")["content"]["answer"]
    assert first_of_type(tree, "type_answer")["content"]["answers"]
    assert first_of_type(tree, "match_pairs")["content"]["pairs"]


def test_admin_is_hidden_when_dev_tools_are_disabled(client, monkeypatch):
    monkeypatch.setattr(settings, "enable_dev_tools", False)
    for method, path in (("GET", "/api/admin/content"), ("PATCH", "/api/admin/units/1")):
        res = client.request(method, path, json={"title": "Nope"})
        assert res.status_code == 404 and res.json()["error"]["code"] == "not_found"


# --------------------------------------------------------------------------- units & skills


def test_unit_and_skill_renames_show_on_the_learning_path(client):
    unit = get_tree(client)["units"][0]
    skill = unit["skills"][0]

    res = client.patch(f"/api/admin/units/{unit['id']}", json={"title": "  Basics  ", "description": "Say hello"})
    assert res.status_code == 200
    assert res.json()["title"] == "Basics" and res.json()["description"] == "Say hello"

    # Fields left out of the body are untouched.
    res = client.patch(f"/api/admin/skills/{skill['id']}", json={"title": "Greetings"})
    assert res.status_code == 200 and res.json()["title"] == "Greetings"
    assert res.json()["icon"] == skill["icon"]

    path_unit = client.get("/api/course").json()["units"][0]
    assert (path_unit["title"], path_unit["description"]) == ("Basics", "Say hello")
    assert path_unit["skills"][0]["title"] == "Greetings"


def test_blank_or_overlong_titles_are_rejected(client):
    unit = get_tree(client)["units"][0]
    unit_url = f"/api/admin/units/{unit['id']}"
    skill_url = f"/api/admin/skills/{unit['skills'][0]['id']}"

    for url, body in (
        (unit_url, {"title": "   "}),
        (unit_url, {"title": "x" * 65}),
        (unit_url, {"description": "x" * 256}),
        (skill_url, {"title": ""}),
        (skill_url, {"title": "x" * 65}),
    ):
        res = client.patch(url, json=body)
        assert res.status_code == 422 and res.json()["error"]["code"] == "validation_error", body

    assert get_tree(client)["units"][0]["title"] == unit["title"]


# --------------------------------------------------------------------------- exercises


def test_exercise_edit_changes_what_is_graded_correct(client):
    lesson_id = active_skill(client)["next_lesson_id"]
    lesson = next(lesson for lesson in all_lessons(get_tree(client)) if lesson["id"] == lesson_id)
    ex = next(e for e in lesson["exercises"] if e["type"] == "multiple_choice")
    new_answer = (ex["content"]["answer"] + 1) % len(ex["content"]["choices"])

    res = patch_exercise(client, ex["id"], {
        "prompt": "Pick the new answer",
        "content": {**ex["content"], "answer": new_answer},
    })
    assert res.status_code == 200
    updated = res.json()
    assert updated["type"] == "multiple_choice" and updated["prompt"] == "Pick the new answer"
    assert updated["content"]["answer"] == new_answer
    assert stored_exercise(client, ex["id"]) == updated

    attempt = client.post(f"/api/lessons/{lesson_id}/attempts").json()
    played = next(e for e in attempt["exercises"] if e["id"] == ex["id"])
    assert played["prompt"] == "Pick the new answer" and "answer" not in played
    assert answer(client, attempt["attempt_id"], ex["id"], new_answer).json()["correct"]


def test_prompt_only_edit_keeps_the_content(client):
    ex = first_of_type(get_tree(client), "translate")
    res = patch_exercise(client, ex["id"], {"prompt": "Translate, please"})
    assert res.status_code == 200
    assert res.json()["prompt"] == "Translate, please" and res.json()["content"] == ex["content"]


@pytest.mark.parametrize(
    ("kind", "edit", "fragment"),
    [
        ("multiple_choice", lambda c: {**c, "answer": len(c["choices"])}, "index of one of the choices"),
        ("multiple_choice", lambda c: {**c, "answer": "0"}, "'answer' must be"),
        ("translate", lambda c: {**c, "answers": []}, "'answers' must be"),
        ("translate", lambda c: {**c, "word_bank": ["nope", "nada"]}, "missing from word bank"),
        ("fill_blank", lambda c: {**c, "sentence": "There is no blank."}, "exactly one ___"),
        ("fill_blank", lambda c: {k: v for k, v in c.items() if k != "answer"}, "missing 'answer'"),
        ("match_pairs", lambda c: {**c, "pairs": [["a", "b"], ["a", "c"]]}, "must be unique"),
        ("type_answer", lambda c: {**c, "type": "translate"}, "type cannot change"),
    ],
)
def test_invalid_exercise_edits_are_rejected(client, kind, edit, fragment):
    ex = first_of_type(get_tree(client), kind)
    res = patch_exercise(client, ex["id"], {"content": edit(ex["content"])})
    assert res.status_code == 422
    error = res.json()["error"]
    assert error["code"] == "invalid_exercise" and fragment in error["message"], error["message"]
    assert stored_exercise(client, ex["id"]) == ex  # nothing was saved


def test_blank_prompt_is_rejected(client):
    ex = first_of_type(get_tree(client), "type_answer")
    res = patch_exercise(client, ex["id"], {"prompt": "  "})
    assert res.status_code == 422 and res.json()["error"]["code"] == "validation_error"


def test_unknown_ids_return_404(client):
    for url, body in (
        ("/api/admin/units/9999", {"title": "Ghost"}),
        ("/api/admin/skills/9999", {"title": "Ghost"}),
        ("/api/admin/exercises/9999", {"prompt": "Ghost"}),
    ):
        res = client.patch(url, json=body)
        assert res.status_code == 404 and res.json()["error"]["code"] == "not_found", url
