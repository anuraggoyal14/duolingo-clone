"use client";

import { useState } from "react";
import { speak } from "@/lib/audio";
import type { FillBlankExercise } from "@/lib/types";
import { ExerciseTitle, SpeakButton, WordTile, type ExerciseProps } from "./shared";

export function FillBlank({ exercise, locked, onAnswerChange }: ExerciseProps<FillBlankExercise>) {
  const [choice, setChoice] = useState<string | null>(null);
  const [before, after] = exercise.sentence.split("___");

  const select = (word: string | null) => {
    if (locked) return;
    setChoice(word);
    onAnswerChange(word);
    if (word) speak(word, "es");
  };

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <div className="mb-3 flex items-center gap-3">
        <SpeakButton text={exercise.sentence.replace("___", choice ?? "…")} lang="es" small />
        <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl font-semibold text-strong">
          {before && <span>{before.trim()}</span>}
          {choice ? (
            <WordTile onClick={() => select(null)} disabled={locked} selected>
              {choice}
            </WordTile>
          ) : (
            <span className="inline-block h-11 w-24 border-b-2 border-strong" aria-label="blank" />
          )}
          {after && <span>{after.trim()}</span>}
        </p>
      </div>
      <p className="mb-10 text-lg text-muted">{exercise.translation}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {exercise.choices.map((word) =>
          word === choice ? (
            <WordTile key={word} placeholder>
              {word}
            </WordTile>
          ) : (
            <WordTile key={word} onClick={() => select(word)} disabled={locked}>
              {word}
            </WordTile>
          ),
        )}
      </div>
    </div>
  );
}
