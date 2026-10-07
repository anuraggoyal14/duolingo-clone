"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/audio";
import type { MultipleChoiceExercise } from "@/lib/types";
import { ExerciseTitle, type ExerciseProps } from "./shared";

export function MultipleChoice({ exercise, locked, onAnswerChange }: ExerciseProps<MultipleChoiceExercise>) {
  const [selected, setSelected] = useState<number | null>(null);
  const withPictures = exercise.choices.every((c) => c.emoji);

  const choose = (index: number) => {
    if (locked) return;
    setSelected(index);
    onAnswerChange(index);
    if (withPictures) speak(exercise.choices[index].text, "es"); // picture cards are Spanish words
  };

  // Number keys 1..n select options, like the original.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= exercise.choices.length && !(e.target instanceof HTMLInputElement)) choose(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const optionClass = (i: number) =>
    [
      "rounded-2xl border-2 border-b-4 transition-colors",
      selected === i ? "border-sel-border bg-sel-bg text-sel-text" : "border-line text-strong hover:bg-hover",
      locked ? "cursor-default" : "active:translate-y-[2px] active:border-b-2",
    ].join(" ");

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      {withPictures ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {exercise.choices.map((choice, i) => (
            <button key={i} type="button" onClick={() => choose(i)} className={`${optionClass(i)} flex flex-col p-3 sm:p-4`}>
              <span className="flex flex-1 items-center justify-center py-4 text-6xl sm:py-8 sm:text-7xl" aria-hidden>
                {choice.emoji}
              </span>
              <span className="flex items-center justify-between gap-2 text-lg font-semibold">
                <span>{choice.text}</span>
                <NumberBadge n={i + 1} active={selected === i} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exercise.choices.map((choice, i) => (
            <button key={i} type="button" onClick={() => choose(i)} className={`${optionClass(i)} flex items-center gap-4 p-4 text-left`}>
              <NumberBadge n={i + 1} active={selected === i} />
              <span className="text-lg font-semibold">{choice.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold sm:flex ${
        active ? "border-sel-border text-sel-text" : "border-line text-faint"
      }`}
    >
      {n}
    </span>
  );
}
