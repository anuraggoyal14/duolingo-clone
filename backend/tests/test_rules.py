"""Unit tests for the pure game rules: grading, hearts, streaks."""

from datetime import date, datetime, timedelta

import pytest

from app.models import Exercise, User
from app.services import gamification as game
from app.services.grading import InvalidAnswer, grade, normalize, public_payload


def make_exercise(kind: str, **content) -> Exercise:
    return Exercise(id=1, type=kind, prompt="p", content=content)


def make_user(**kwargs) -> User:
    defaults = dict(hearts=5, hearts_updated_at=datetime(2026, 1, 1), streak_count=0,
                    longest_streak=0, last_streak_date=None)
    return User(**{**defaults, **kwargs})


# --------------------------------------------------------------------------- grading


def test_normalize_strips_case_punctuation_and_spanish_marks():
    assert normalize("¿Cómo  estás?") == "cómo estás"
    assert normalize("¿Cómo estás?", keep_accents=False) == "como estas"


def test_multiple_choice():
    ex = make_exercise("multiple_choice", choices=[{"text": "el agua"}, {"text": "el pan"}], answer=1)
    assert grade(ex, 1).correct
    result = grade(ex, 0)
    assert not result.correct and result.solution == "el pan"
    with pytest.raises(InvalidAnswer):
        grade(ex, "1")


def test_translate_accepts_word_list_and_alternatives():
    ex = make_exercise("translate", answers=["Yo bebo agua.", "Bebo agua."], word_bank=[])
    assert grade(ex, ["Yo", "bebo", "agua"]).correct
    assert grade(ex, ["Bebo", "agua"]).correct
    assert not grade(ex, ["agua", "bebo"]).correct
    assert not grade(ex, []).correct


def test_type_answer_is_lenient_with_accents_and_single_typos():
    ex = make_exercise("type_answer", answers=["el niño"])
    assert grade(ex, "El niño").note is None
    accent = grade(ex, "el nino")
    assert accent.correct and "accents" in accent.note
    typo = grade(ex, "el niñoo")
    assert typo.correct and "typo" in typo.note
    assert not grade(ex, "la niña ").correct  # different word, not a typo


def test_fill_blank_and_match_pairs():
    fill = make_exercise("fill_blank", sentence="Yo ___ agua.", choices=["bebo", "como"], answer="bebo")
    assert grade(fill, "bebo").correct
    assert grade(fill, "como").solution == "Yo bebo agua."

    pairs = make_exercise("match_pairs", pairs=[["el pan", "bread"], ["el agua", "water"]])
    assert grade(pairs, [["el agua", "water"], ["el pan", "bread"]]).correct
    assert not grade(pairs, [["el agua", "bread"], ["el pan", "water"]]).correct


def test_public_payload_hides_answer_keys():
    ex = make_exercise("type_answer", source="the boy", answers=["el niño"])
    payload = public_payload(ex)
    assert "answers" not in payload and payload["source"] == "the boy"


# --------------------------------------------------------------------------- hearts


def test_hearts_regenerate_lazily_one_per_interval():
    start = datetime(2026, 1, 1, 12, 0)
    user = make_user(hearts=5, hearts_updated_at=start)
    game.lose_heart(user, start)
    game.lose_heart(user, start)
    assert user.hearts == 3

    interval = timedelta(minutes=game.settings.heart_regen_minutes)
    game.sync_hearts(user, start + interval - timedelta(seconds=1))
    assert user.hearts == 3
    game.sync_hearts(user, start + interval + timedelta(seconds=1))
    assert user.hearts == 4
    assert game.next_heart_at(user) == start + 2 * interval  # partial progress preserved
    game.sync_hearts(user, start + 10 * interval)
    assert user.hearts == game.MAX_HEARTS and game.next_heart_at(user) is None


def test_hearts_never_go_negative():
    user = make_user(hearts=0)
    game.lose_heart(user, datetime(2026, 1, 1))
    assert user.hearts == 0


# --------------------------------------------------------------------------- streak


def test_streak_increments_once_per_day_and_resets_after_a_gap():
    user = make_user()
    day = date(2026, 3, 10)
    assert game.register_activity(user, day) is True
    assert game.register_activity(user, day) is False  # second lesson same day
    assert user.streak_count == 1
    game.register_activity(user, day + timedelta(days=1))
    assert user.streak_count == 2 and user.longest_streak == 2

    # Streak is still alive (but not yet extended) the next day...
    assert game.current_streak(user, day + timedelta(days=2)) == 2
    # ...and broken after a full missed day.
    assert game.current_streak(user, day + timedelta(days=3)) == 0
    game.register_activity(user, day + timedelta(days=3))
    assert user.streak_count == 1 and user.longest_streak == 2


def test_moving_to_an_earlier_timezone_does_not_reset_the_streak():
    user = make_user(streak_count=5, longest_streak=5, last_streak_date=date(2026, 10, 9))
    # Already practised on the 9th in the old timezone; the new timezone says it's the 8th.
    assert game.register_activity(user, date(2026, 10, 8)) is False
    assert user.streak_count == 5 and user.last_streak_date == date(2026, 10, 9)
