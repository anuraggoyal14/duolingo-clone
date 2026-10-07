"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import type { AnswerResult } from "@/lib/types";

const PRAISE = ["Nicely done!", "Great job!", "Amazing!", "Correct!", "Excellent!", "You're on fire!"];

interface FooterProps {
  feedback: AnswerResult | null;
  canCheck: boolean;
  checking: boolean;
  canSkip: boolean;
  onCheck: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

/** Bottom bar: SKIP/CHECK while answering, then the green/red feedback bar with CONTINUE. */
export function FeedbackFooter({ feedback, canCheck, checking, canSkip, onCheck, onSkip, onContinue }: FooterProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- new praise per feedback
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [feedback]);

  if (!feedback) {
    return (
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-4 py-5 sm:py-8">
          {canSkip ? (
            <Button variant="outline" onClick={onSkip} disabled={checking} className="hidden !text-muted sm:inline-flex">
              Skip
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onCheck} disabled={!canCheck || checking} className="w-full sm:w-auto sm:min-w-[150px]">
            Check
          </Button>
        </div>
      </footer>
    );
  }

  const correct = feedback.correct;
  return (
    <footer className={`animate-slide-up ${correct ? "bg-correct-bg" : "bg-wrong-bg"}`} role="status" aria-live="assertive">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-8">
        <div className="flex items-center gap-4">
          <span
            className={`hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white sm:flex ${correct ? "text-owl" : "text-cardinal"}`}
          >
            {correct ? <CheckIcon className="h-10 w-10" /> : <CloseIcon className="h-9 w-9" />}
          </span>
          <div className={correct ? "text-owl-text" : "text-cardinal"}>
            <h2 className="text-2xl font-extrabold">{correct ? praise : "Correct solution:"}</h2>
            {!correct && feedback.solution && <p className="text-lg font-semibold">{feedback.solution}</p>}
            {correct && feedback.note && (
              <p className="font-semibold">
                {feedback.note} {feedback.solution && <span className="font-bold">{feedback.solution}</span>}
              </p>
            )}
          </div>
        </div>
        <Button variant={correct ? "primary" : "danger"} onClick={onContinue} className="w-full sm:w-auto sm:min-w-[150px]" autoFocus>
          Continue
        </Button>
      </div>
    </footer>
  );
}
