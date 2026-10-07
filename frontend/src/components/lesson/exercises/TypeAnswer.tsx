"use client";

import { useEffect, useRef, useState } from "react";
import type { TypeAnswerExercise } from "@/lib/types";
import { ExerciseTitle, SpeechBubble, type ExerciseProps } from "./shared";

const SPANISH_CHARACTERS = ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"];

export function TypeAnswer({ exercise, locked, onAnswerChange, onSubmit }: ExerciseProps<TypeAnswerExercise>) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const writingSpanish = exercise.source_lang === "en";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const update = (value: string) => {
    setText(value);
    onAnswerChange(value.trim() ? value : null);
  };

  const insert = (ch: string) => {
    const el = inputRef.current;
    if (!el || locked) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    update(text.slice(0, start) + ch + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  };

  return (
    <div>
      <ExerciseTitle>{exercise.prompt}</ExerciseTitle>
      <SpeechBubble text={exercise.source} lang={exercise.source_lang} />
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (text.trim()) onSubmit();
          }
        }}
        readOnly={locked}
        rows={3}
        maxLength={200}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder={writingSpanish ? "Type in Spanish" : "Type in English"}
        aria-label="Your answer"
        className="w-full resize-none rounded-2xl border-2 border-line bg-hover p-4 text-lg text-strong outline-none focus:border-sel-border"
      />
      {writingSpanish && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SPANISH_CHARACTERS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => insert(ch)}
              disabled={locked}
              className="h-10 w-10 rounded-xl border-2 border-b-4 border-line text-lg font-semibold text-strong hover:bg-hover"
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
