"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CloseIcon, GemIcon, HeartIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { playSound } from "@/lib/audio";
import type { AnswerResult, AnswerValue, Attempt, Completion, Exercise } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { LessonCompleteScreen, StreakScreen } from "./Celebration";
import { ExerciseView, skipAnswer } from "./ExerciseView";
import { FeedbackFooter } from "./FeedbackFooter";

type Source = { kind: "lesson"; lessonId: number } | { kind: "practice" };

/**
 * Runs one lesson: shows exercises in order, checks answers on the server, re-queues
 * mistakes at the end (like Duolingo), tracks hearts, then completes the attempt.
 */
export function LessonPlayer({ source }: { source: Source }) {
  const router = useRouter();
  const toast = useToast();
  const { me, refresh, setMe } = useUser();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [turn, setTurn] = useState(0); // bumps on every new exercise so components remount
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const answerRef = useRef<AnswerValue | null>(null);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [hearts, setHearts] = useState(0);
  const [solved, setSolved] = useState(0);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [busy, setBusy] = useState(false);

  // ------------------------------------------------------------------ start
  useEffect(() => {
    let cancelled = false;
    const start = source.kind === "lesson" ? api.startLesson(source.lessonId) : api.startPractice();
    start
      .then((data) => {
        if (cancelled) return;
        setAttempt(data);
        setQueue(data.exercises);
        setHearts(data.hearts);
      })
      .catch((e) => !cancelled && setLoadError(e instanceof ApiError ? e : new ApiError(0, "unknown", String(e))));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start exactly once per mount
  }, []);

  const current = queue[0];
  const total = attempt?.exercises.length ?? 1;

  const changeAnswer = useCallback((value: AnswerValue | null) => {
    answerRef.current = value;
    setAnswer(value);
  }, []);

  // ------------------------------------------------------------------ check / continue
  const submit = useCallback(
    async (value: AnswerValue | null) => {
      if (!attempt || !current || checking || feedback || value === null) return;
      setChecking(true);
      try {
        const result = await api.answer(attempt.attempt_id, current.id, value);
        setFeedback(result);
        setHearts(result.hearts);
        playSound(result.correct ? "correct" : "wrong");
      } catch (e) {
        if (e instanceof ApiError && e.code === "out_of_hearts") setOutOfHearts(true);
        else toast(e instanceof ApiError ? e.message : "Something went wrong", { tone: "error" });
      } finally {
        setChecking(false);
      }
    },
    [attempt, current, checking, feedback, toast],
  );

  const check = useCallback(() => submit(answerRef.current), [submit]);
  const skip = useCallback(() => current && submit(skipAnswer(current)), [current, submit]);

  const finish = useCallback(async () => {
    if (!attempt) return;
    setBusy(true);
    try {
      const result = await api.complete(attempt.attempt_id);
      playSound("complete");
      setCompletion(result);
      result.new_achievements.forEach((a) =>
        toast(`Achievement unlocked: ${a.title}`, { tone: "achievement", icon: <span className="text-xl">🏆</span> }),
      );
      refresh();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Couldn't save your progress. Try again.", { tone: "error" });
    } finally {
      setBusy(false);
    }
  }, [attempt, refresh, toast]);

  const advance = useCallback(() => {
    if (!feedback || !current) return;
    const rest = queue.slice(1);
    // Mistakes come back at the end of the lesson until answered correctly.
    const nextQueue = feedback.correct ? rest : [...rest, current];
    if (feedback.correct) setSolved((n) => n + 1);
    setQueue(nextQueue);
    setFeedback(null);
    changeAnswer(null);
    setTurn((t) => t + 1);

    if (attempt?.hearts_enabled && feedback.hearts <= 0) {
      setOutOfHearts(true);
    } else if (nextQueue.length === 0) {
      finish();
    }
  }, [feedback, current, queue, attempt, changeAnswer, finish]);

  // Enter = CHECK / CONTINUE.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || quitOpen || outOfHearts || completion) return;
      // Footer/modal buttons handle Enter natively; the text input submits itself while answering.
      // preventDefault below stops a focused option/tile button from also being "clicked".
      if (e.target instanceof HTMLElement && e.target.closest("footer button, [role=dialog]")) return;
      if (e.target instanceof HTMLTextAreaElement && !feedback) return;
      e.preventDefault();
      if (feedback) advance();
      else check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, advance, check, quitOpen, outOfHearts, completion]);

  // ------------------------------------------------------------------ hearts modal actions
  const refillHearts = async () => {
    setBusy(true);
    try {
      const updated = await api.refillHearts();
      setMe(updated);
      setHearts(updated.hearts);
      setOutOfHearts(false);
      toast("Hearts refilled!", { tone: "success", icon: <HeartIcon className="h-5 w-5" /> });
      if (queue.length === 0) finish();
    } catch (e) {
      if (e instanceof ApiError && e.code === "hearts_full") {
        // Hearts were refilled elsewhere or regenerated meanwhile: just carry on.
        await refresh();
        setHearts(attempt?.max_hearts ?? 5);
        setOutOfHearts(false);
        if (queue.length === 0) finish();
      } else {
        toast(e instanceof ApiError ? e.message : "Refill failed", { tone: "error" });
      }
    } finally {
      setBusy(false);
    }
  };

  const exit = () => {
    refresh();
    router.push("/learn");
  };

  // ------------------------------------------------------------------ render
  if (loadError) return <LoadError error={loadError} />;
  if (!attempt) return <LessonLoading />;
  if (completion && showStreak) return <StreakScreen streak={completion.streak} today={me?.today} onContinue={exit} />;
  if (completion) {
    return (
      <LessonCompleteScreen
        result={completion}
        kind={attempt.kind}
        onContinue={() => (completion.streak_extended ? setShowStreak(true) : exit())}
      />
    );
  }

  const heartsEnabled = attempt.hearts_enabled;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1000px] items-center gap-4 px-4 pt-5 sm:pt-12">
        <button onClick={() => setQuitOpen(true)} aria-label="Quit lesson" className="text-faint hover:text-muted">
          <CloseIcon className="h-7 w-7" />
        </button>
        <ProgressBar value={solved / total} />
        <div className={`flex items-center gap-1.5 text-lg font-extrabold ${heartsEnabled ? "text-cardinal" : "text-sky"}`}>
          <HeartIcon className="h-7 w-7" dim={heartsEnabled && hearts === 0} />
          {heartsEnabled ? hearts : "∞"}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center px-4 py-8">
        {current && (
          <ExerciseView
            key={`${current.id}-${turn}`}
            exercise={current}
            locked={!!feedback || checking}
            onAnswerChange={changeAnswer}
            onSubmit={check}
          />
        )}
        {!current && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Mascot mood={busy ? "think" : "sad"} className="h-28 w-28" />
            {busy ? (
              <p className="font-bold text-muted">Saving your progress…</p>
            ) : (
              <Button variant="secondary" onClick={finish}>
                Retry saving
              </Button>
            )}
          </div>
        )}
      </main>

      <FeedbackFooter
        feedback={feedback}
        canCheck={answer !== null}
        checking={checking}
        canSkip={current?.type !== "match_pairs"}
        onCheck={check}
        onSkip={skip}
        onContinue={advance}
      />

      <Modal open={quitOpen} onClose={() => setQuitOpen(false)} labelledBy="quit-title">
        <Mascot mood="sad" className="mx-auto mb-4 h-28 w-28" />
        <h2 id="quit-title" className="mb-2 text-2xl font-extrabold text-strong">
          Wait, don&apos;t go!
        </h2>
        <p className="mb-6 text-muted">You&apos;ll lose your progress if you quit now.</p>
        <div className="flex flex-col gap-3">
          <Button variant="secondary" fullWidth onClick={() => setQuitOpen(false)}>
            Keep learning
          </Button>
          <Button variant="ghost" fullWidth onClick={exit} className="!text-cardinal">
            End session
          </Button>
        </div>
      </Modal>

      <Modal open={outOfHearts} labelledBy="hearts-title">
        <div className="mb-4 flex justify-center">
          <HeartIcon className="h-24 w-24" dim />
        </div>
        <h2 id="hearts-title" className="mb-2 text-2xl font-extrabold text-strong">
          You ran out of hearts!
        </h2>
        <p className="mb-6 text-muted">
          Hearts come back over time ({me?.heart_regen_minutes ?? 30} min each). Refill now to keep going.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={refillHearts}
            disabled={busy || (me ? me.gems < me.heart_refill_cost : false)}
          >
            Refill · <GemIcon className="h-5 w-5" /> {me?.heart_refill_cost ?? 350}
          </Button>
          <Link href="/practice" onClick={() => setOutOfHearts(false)}>
            <Button variant="outline" fullWidth>
              Practice to earn hearts
            </Button>
          </Link>
          <Button variant="ghost" fullWidth onClick={exit} className="!text-muted">
            No thanks
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function LessonLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Mascot mood="think" className="h-32 w-32 animate-float" />
      <p className="font-extrabold uppercase tracking-wide text-faint">Loading…</p>
    </div>
  );
}

function LoadError({ error }: { error: ApiError }) {
  const outOfHearts = error.code === "out_of_hearts";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      {outOfHearts ? <HeartIcon className="h-24 w-24" dim /> : <Mascot mood="sad" className="h-32 w-32" />}
      <h1 className="text-2xl font-extrabold text-strong">
        {outOfHearts ? "You're out of hearts" : error.code === "lesson_locked" ? "This lesson is locked" : "Couldn't start the lesson"}
      </h1>
      <p className="max-w-sm text-muted">{error.message}</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {outOfHearts && (
          <>
            <Link href="/shop">
              <Button variant="secondary" fullWidth>
                Refill hearts
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="outline" fullWidth>
                Practice to earn hearts
              </Button>
            </Link>
          </>
        )}
        <Link href="/learn">
          <Button variant={outOfHearts ? "ghost" : "primary"} fullWidth>
            Back to learn
          </Button>
        </Link>
      </div>
    </div>
  );
}
