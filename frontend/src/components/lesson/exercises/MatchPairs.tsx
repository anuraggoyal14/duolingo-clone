"use client";

import { useEffect, useState } from "react";
import { playSound, speak } from "@/lib/audio";
import type { MatchPairsExercise } from "@/lib/types";
import { ExerciseTitle, shuffle, type ExerciseProps } from "./shared";

type Side = "left" | "right";

/** Tap one word on each side; correct matches lock in, wrong ones shake. Mismatches don't
 *  cost hearts. When every pair is matched the exercise submits itself. */
export function MatchPairs({ exercise, locked, onAnswerChange, onSubmit }: ExerciseProps<MatchPairsExercise>) {
  const [left] = useState(() => shuffle(exercise.pairs.map((p) => p[0])));
  const [right] = useState(() => shuffle(exercise.pairs.map((p) => p[1])));
  const [selection, setSelection] = useState<{ left?: string; right?: string }>({});
  const [matched, setMatched] = useState<string[][]>([]);
  const [wrong, setWrong] = useState<{ left?: string; right?: string }>({});
  const [justMatched, setJustMatched] = useState<string[]>([]);

  const isMatched = (side: Side, word: string) => matched.some((p) => p[side === "left" ? 0 : 1] === word);

  const tap = (side: Side, word: string) => {
    if (locked || isMatched(side, word)) return;
    if (side === "left") speak(word, "es");
    const next = { ...selection, [side]: word };
    if (!next.left || !next.right) {
      setSelection(next);
      return;
    }
    const correct = exercise.pairs.some(([l, r]) => l === next.left && r === next.right);
    setSelection({});
    if (correct) {
      const all = [...matched, [next.left, next.right]];
      setMatched(all);
      setJustMatched([next.left, next.right]);
      setTimeout(() => setJustMatched([]), 400);
      if (all.length === exercise.pairs.length) {
        onAnswerChange(all);
        setTimeout(onSubmit, 350);
      } else {
        playSound("correct");
      }
    } else {
      setWrong(next);
      playSound("wrong");
      setTimeout(() => setWrong({}), 450);
    }
  };

  // Keys 1-5 pick from the left column, 6-9 and 0 from the right (matching the badges).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!/^[0-9]$/.test(e.key)) return;
      const n = e.key === "0" ? 10 : Number(e.key);
      if (n <= left.length) tap("left", left[n - 1]);
      else if (n - left.length <= right.length) tap("right", right[n - left.length - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const tileClass = (side: Side, word: string) => {
    if (isMatched(side, word)) {
      return justMatched.includes(word)
        ? "border-owl bg-correct-bg text-owl-text"
        : "border-line text-faint opacity-60 cursor-default";
    }
    if (wrong[side] === word) return "animate-shake border-cardinal bg-wrong-bg text-cardinal";
    if (selection[side] === word) return "border-sel-border bg-sel-bg text-sel-text";
    return "border-line text-strong hover:bg-hover active:translate-y-[2px] active:border-b-2";
  };

  const column = (side: Side, words: string[], offset: number) => (
    <div className="flex flex-col gap-3">
      {words.map((word, i) => (
        <button
          key={word}
          type="button"
          onClick={() => tap(side, word)}
          disabled={isMatched(side, word)}
          className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-2 text-left text-lg font-semibold transition-colors ${tileClass(side, word)}`}
        >
          <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-line text-sm font-bold text-faint sm:flex">
            {(i + offset) % 10}
          </span>
          <span className="flex-1 text-center sm:text-left">{word}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {column("left", left, 1)}
        {column("right", right, left.length + 1)}
      </div>
    </div>
  );
}
