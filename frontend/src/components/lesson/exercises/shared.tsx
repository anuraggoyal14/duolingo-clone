"use client";

import { SpeakerIcon } from "@/components/ui/icons";
import { characterFor, Diego, Lucia, Mateo, Sofia, type CharacterComponent } from "@/components/art";
import { canSpeak, speak } from "@/lib/audio";
import type { AnswerValue, Exercise } from "@/lib/types";

/** Props every exercise component receives from the lesson player. */
export interface ExerciseProps<E extends Exercise> {
  exercise: E;
  /** True once the answer has been checked: inputs are frozen. */
  locked: boolean;
  /** Report the current answer (null = nothing selected yet, CHECK stays disabled). */
  onAnswerChange: (answer: AnswerValue | null) => void;
  /** For exercises that finish themselves (match pairs) or Enter-to-submit inputs. */
  onSubmit: () => void;
}

export function ExerciseTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-2xl font-extrabold text-strong sm:text-[32px] sm:leading-tight">{children}</h1>;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function SpeakButton({ text, lang, small = false }: { text: string; lang: string; small?: boolean }) {
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, lang)}
      aria-label="Play audio"
      className={`flex shrink-0 items-center justify-center rounded-xl bg-sky text-white shadow-[0_4px_0_#1899d6] active:translate-y-[2px] active:shadow-[0_2px_0_#1899d6] ${small ? "h-9 w-9" : "h-11 w-11"}`}
    >
      <SpeakerIcon className={small ? "h-5 w-5" : "h-6 w-6"} />
    </button>
  );
}

// First-person sentences ("I am a man", "Soy una niña") need a speaker who matches them.
const SELF_DESCRIPTIONS: [RegExp, CharacterComponent][] = [
  [/\b(man|hombre)\b/, Mateo],
  [/\b(woman|mujer)\b/, Sofia],
  [/\b(boy|niño)\b/, Diego],
  [/\b(girl|niña)\b/, Lucia],
];

function speakerFor(text: string, seed: number): CharacterComponent {
  const sentence = text.toLowerCase();
  if (/\b(i am|i'm|yo soy|soy)\b/.test(sentence)) {
    const match = SELF_DESCRIPTIONS.find(([pattern]) => pattern.test(sentence));
    if (match) return match[1];
  }
  return characterFor(seed);
}

/** A cast character with a speech bubble. `seed` (the exercise id) picks the character so the
 *  same exercise always gets the same speaker. */
export function SpeechBubble({ text, lang, seed }: { text: string; lang: string; seed: number }) {
  const Speaker = speakerFor(text, seed);
  return (
    <div className="mb-6 flex items-end gap-3">
      <Speaker className="h-28 w-auto shrink-0 sm:h-36" />
      <div className="relative mb-8 flex items-center gap-3 rounded-2xl border-2 border-line px-4 py-3">
        <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-bg" />
        {lang === "es" && <SpeakButton text={text} lang={lang} small />}
        <span className="text-lg font-semibold text-strong">{text}</span>
      </div>
    </div>
  );
}

/** A tappable word tile, used by the word bank and fill-in-the-blank choices. */
export function WordTile({
  children,
  onClick,
  disabled,
  placeholder,
  selected,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  placeholder?: boolean;
  selected?: boolean;
}) {
  if (placeholder) {
    return (
      <span className="rounded-xl bg-line px-4 py-2.5 text-lg font-semibold text-transparent" aria-hidden>
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "animate-pop-in rounded-xl border-2 border-b-4 px-4 py-2 text-lg font-semibold transition-colors",
        selected ? "border-sel-border bg-sel-bg text-sel-text" : "border-line bg-panel text-strong",
        disabled ? "cursor-default" : "hover:bg-hover active:translate-y-[2px] active:border-b-2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
