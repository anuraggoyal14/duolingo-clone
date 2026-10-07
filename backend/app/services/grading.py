"""Server-side answer checking.

Answer keys live in `Exercise.content` and are stripped by `public_payload` before an
exercise is sent to the browser, so the client cannot read the answers from the network tab.
(Match-pairs is the exception: the pairs themselves are the exercise, and the client needs
them for instant per-tap feedback.)
"""

import re
import unicodedata
from dataclasses import dataclass
from typing import Any

from app.models import Exercise

# Keys that reveal the answer, per exercise type.
_SECRET_KEYS = {
    "multiple_choice": ("answer",),
    "translate": ("answers",),
    "fill_blank": ("answer",),
    "type_answer": ("answers",),
    "match_pairs": (),
}


@dataclass
class GradeResult:
    correct: bool
    solution: str  # canonical correct answer, shown in the feedback bar
    note: str | None = None  # e.g. "You have a typo" while still accepting the answer


class InvalidAnswer(ValueError):
    """Raised when the submitted answer has the wrong shape for the exercise type."""


def public_payload(exercise: Exercise) -> dict[str, Any]:
    content = {k: v for k, v in exercise.content.items() if k not in _SECRET_KEYS[exercise.type]}
    return {"id": exercise.id, "type": exercise.type, "prompt": exercise.prompt, **content}


def _strip_accents(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def normalize(text: str, *, keep_accents: bool = True) -> str:
    """Lowercase, drop punctuation (incl. ¿ ¡), collapse whitespace; optionally drop accents."""
    text = unicodedata.normalize("NFC", text).lower()
    if not keep_accents:
        text = _strip_accents(text)
    text = re.sub(r"[^\w\s']", " ", text)
    return " ".join(text.split())


def _levenshtein(a: str, b: str) -> int:
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        current = [i]
        for j, cb in enumerate(b, start=1):
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (ca != cb)))
        previous = current
    return previous[-1]


def _match_text(answer: str, accepted: list[str], *, allow_typos: bool) -> GradeResult:
    solution = accepted[0]
    given = normalize(answer)
    if not given:
        return GradeResult(False, solution)

    for option in accepted:
        if given == normalize(option):
            return GradeResult(True, option)

    for option in accepted:
        if normalize(answer, keep_accents=False) == normalize(option, keep_accents=False):
            return GradeResult(True, option, "Pay attention to the accents.")

    if allow_typos:
        for option in accepted:
            target = normalize(option, keep_accents=False)
            if len(target) >= 5 and _levenshtein(normalize(answer, keep_accents=False), target) == 1:
                return GradeResult(True, option, "You have a typo.")

    return GradeResult(False, solution)


def grade(exercise: Exercise, answer: Any) -> GradeResult:
    content = exercise.content
    kind = exercise.type

    if kind == "multiple_choice":
        if not isinstance(answer, int) or isinstance(answer, bool):
            raise InvalidAnswer("multiple_choice expects the index of the chosen option")
        correct_index = content["answer"]
        return GradeResult(answer == correct_index, content["choices"][correct_index]["text"])

    if kind == "translate":
        if isinstance(answer, list) and all(isinstance(w, str) for w in answer):
            answer = " ".join(answer)
        if not isinstance(answer, str):
            raise InvalidAnswer("translate expects a list of words or a sentence")
        return _match_text(answer, content["answers"], allow_typos=False)

    if kind == "fill_blank":
        if not isinstance(answer, str):
            raise InvalidAnswer("fill_blank expects the chosen word")
        solution = content["sentence"].replace("___", content["answer"])
        return GradeResult(answer == content["answer"], solution)

    if kind == "type_answer":
        if not isinstance(answer, str):
            raise InvalidAnswer("type_answer expects text")
        return _match_text(answer, content["answers"], allow_typos=True)

    if kind == "match_pairs":
        if not isinstance(answer, list) or not all(
            isinstance(p, list) and len(p) == 2 and all(isinstance(x, str) for x in p) for p in answer
        ):
            raise InvalidAnswer("match_pairs expects a list of [left, right] pairs")
        expected = {tuple(p) for p in content["pairs"]}
        given = {tuple(p) for p in answer}
        return GradeResult(given == expected and len(answer) == len(expected), "")

    raise InvalidAnswer(f"Unsupported exercise type {kind}")
