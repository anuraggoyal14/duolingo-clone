"use client";

import { useState } from "react";
import { speak } from "@/lib/audio";
import type { TranslateExercise } from "@/lib/types";
import { ExerciseTitle, SpeechBubble, WordTile, type ExerciseProps } from "./shared";

/** Tap-the-words translation: tiles move from the word bank into the answer line and back. */
export function Translate({ exercise, locked, onAnswerChange }: ExerciseProps<TranslateExercise>) {
  // Indices into word_bank (tiles can repeat, so we track positions, not strings).
  const [chosen, setChosen] = useState<number[]>([]);
  const targetLang = exercise.source_lang === "en" ? "es" : "en";

  const update = (next: number[]) => {
    setChosen(next);
    onAnswerChange(next.length ? next.map((i) => exercise.word_bank[i]) : null);
  };

  const pick = (bankIndex: number) => {
    if (locked) return;
    if (targetLang === "es") speak(exercise.word_bank[bankIndex], "es");
    update([...chosen, bankIndex]);
  };
  const unpick = (position: number) => !locked && update(chosen.filter((_, i) => i !== position));

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <SpeechBubble text={exercise.source} lang={exercise.source_lang} seed={exercise.id} />

      {/* Answer area drawn on two "ruled" lines */}
      <div
        className="mb-8 flex min-h-[124px] flex-wrap content-start gap-2 py-1"
        style={{ backgroundImage: "linear-gradient(transparent 58px, var(--border) 58px, var(--border) 60px, transparent 60px)", backgroundSize: "100% 62px" }}
        aria-label="Your answer"
      >
        {chosen.map((bankIndex, position) => (
          <WordTile key={`${bankIndex}-${position}`} onClick={() => unpick(position)} disabled={locked}>
            {exercise.word_bank[bankIndex]}
          </WordTile>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2" aria-label="Word bank">
        {exercise.word_bank.map((word, i) =>
          chosen.includes(i) ? (
            <WordTile key={i} placeholder>
              {word}
            </WordTile>
          ) : (
            <WordTile key={i} onClick={() => pick(i)} disabled={locked}>
              {word}
            </WordTile>
          ),
        )}
      </div>
    </div>
  );
}
