"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CloseIcon, GemIcon, HeartIcon, TrophyIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { playSound } from "@/lib/audio";
import { useCountdown } from "@/lib/hooks";
import type { AnswerResult, AnswerValue, Attempt, Completion, Exercise } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { LessonCompleteScreen, StreakScreen } from "./Celebration";
import { ExerciseView, skipAnswer } from "./ExerciseView";
import { FeedbackFooter } from "./FeedbackFooter";

type Source =
  | { kind: "lesson"; lessonId: number }
  | { kind: "practice" }
  | { kind: "legendary"; skillId: number };

type Failure = "time_up" | "mistakes";

// Consecutive-correct counts that trigger a "N in a row!" combo message.
const COMBO_MILESTONES = new Set([3, 5, 8, 10, 15, 20]);

/**
 * Runs one lesson: shows exercises in order, checks answers on the server, re-queues
 * mistakes at the end (like Duolingo), tracks hearts, then completes the attempt.
 * Legendary challenges add a countdown and a mistake allowance (both enforced by the server).
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
  const [mistakes, setMistakes] = useState(0);
  // A ref (not state) so self-submitting exercises with older closures still count correctly.
  const comboRef = useRef(0);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const timeLeft = useCountdown(failure || completion ? null : deadline);

  // ------------------------------------------------------------------ start
  useEffect(() => {
    let cancelled = false;
    const start =
      source.kind === "lesson"
        ? api.startLesson(source.lessonId)
        : source.kind === "legendary"
          ? api.startLegendary(source.skillId)
          : api.startPractice();
    start
      .then((data) => {
        if (cancelled) return;
        setAttempt(data);
        setQueue(data.exercises);
        setHearts(data.hearts);
        if (data.time_limit_seconds) setDeadline(Date.now() + data.time_limit_seconds * 1000);
      })
      .catch((e) => !cancelled && setLoadError(e instanceof ApiError ? e : new ApiError(0, "unknown", String(e))));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start exactly once per mount
  }, []);

  const current = queue[0];
  const total = attempt?.exercises.length ?? 1;

  // Timed modes: show the "time's up" screen when the clock runs out (the server rejects
  // late answers anyway, so this is purely UX).
  useEffect(() => {
    if (deadline == null || failure || completion) return;
    const timer = setInterval(() => {
      if (Date.now() >= deadline) setFailure("time_up");
    }, 500);
    return () => clearInterval(timer);
  }, [deadline, failure, completion]);

  const showCombo = useCallback((count: number) => {
    if (!COMBO_MILESTONES.has(count)) return;
    setComboMessage(`${count} in a row!`);
    setTimeout(() => setComboMessage(null), 2200);
  }, []);

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
        if (result.correct) {
          comboRef.current += 1;
          showCombo(comboRef.current);
        } else {
          comboRef.current = 0;
          setMistakes((m) => m + 1);
        }
      } catch (e) {
        if (e instanceof ApiError && e.code === "out_of_hearts") setOutOfHearts(true);
        else if (e instanceof ApiError && (e.code === "time_up" || e.code === "attempt_finished")) setFailure("time_up");
        else toast(e instanceof ApiError ? e.message : "Something went wrong", { tone: "error" });
      } finally {
        setChecking(false);
      }
    },
    [attempt, current, checking, feedback, toast, showCombo],
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
      if (e instanceof ApiError && (e.code === "time_up" || e.code === "attempt_failed")) setFailure("time_up");
      else toast(e instanceof ApiError ? e.message : "Couldn't save your progress. Try again.", { tone: "error" });
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

    if (feedback.attempt_status === "failed") {
      setFailure("mistakes");
    } else if (attempt?.hearts_enabled && feedback.hearts <= 0) {
      setOutOfHearts(true);
    } else if (nextQueue.length === 0) {
      finish();
    }
  }, [feedback, current, queue, attempt, changeAnswer, finish]);

  // Enter = CHECK / CONTINUE.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || quitOpen || outOfHearts || completion || failure) return;
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
  }, [feedback, advance, check, quitOpen, outOfHearts, completion, failure]);

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
        onContinue={() => (completion.streak_extended ? setShowStreak(true) : exit())}
      />
    );
  }

  const heartsEnabled = attempt.hearts_enabled;
  const legendary = attempt.kind === "legendary";
  const triesLeft = (attempt.max_mistakes ?? 0) - mistakes;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1000px] items-center gap-4 px-4 pt-5 sm:pt-12">
        <button onClick={() => setQuitOpen(true)} aria-label="Quit lesson" className="text-faint hover:text-muted">
          <CloseIcon className="h-7 w-7" />
        </button>
        <div className="relative flex-1">
          <ProgressBar value={solved / total} color={legendary ? "bee" : "owl"} />
          {comboMessage && (
            <span className="animate-pop-in absolute -bottom-8 left-0 text-sm font-extrabold uppercase tracking-wide text-fox">
              🔥 {comboMessage}
            </span>
          )}
        </div>
        {legendary ? (
          <>
            <span
              className="rounded-xl bg-bee px-2.5 py-1 font-extrabold tabular-nums text-white"
              aria-label={`Time left ${timeLeft}`}
            >
              ⏱ {timeLeft || "0:00"}
            </span>
            <div className="flex items-center gap-1.5 text-lg font-extrabold text-cardinal" title="Mistakes left">
              <HeartIcon className="h-7 w-7" dim={triesLeft <= 0} />
              {Math.max(triesLeft, 0)}
            </div>
          </>
        ) : (
          <div className={`flex items-center gap-1.5 text-lg font-extrabold ${heartsEnabled ? "text-cardinal" : "text-sky"}`}>
            {/* key={hearts} replays the pop animation whenever a heart is lost or regained */}
            <span key={hearts} className="animate-pop-in">
              <HeartIcon className="h-7 w-7" dim={heartsEnabled && hearts === 0} />
            </span>
            {heartsEnabled ? hearts : "∞"}
          </div>
        )}
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

      <Modal open={failure !== null} labelledBy="failed-title">
        <Mascot mood="sad" className="mx-auto mb-4 h-28 w-28" />
        <h2 id="failed-title" className="mb-2 text-2xl font-extrabold text-strong">
          {failure === "time_up" ? "Time's up!" : "Out of tries!"}
        </h2>
        <p className="mb-6 text-muted">
          Legendary challenges allow {(attempt.max_mistakes ?? 3) - 1} mistakes and{" "}
          {Math.round((attempt.time_limit_seconds ?? 180) / 60)} minutes. You&apos;ve got this. Try again!
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="secondary" fullWidth onClick={() => window.location.reload()}>
            <TrophyIcon className="h-5 w-5" /> Try again
          </Button>
          <Button variant="ghost" fullWidth onClick={exit} className="!text-muted">
            Back to learn
          </Button>
        </div>
      </Modal>

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
          <Link
            href="/premium"
            className="premium-gradient premium-shine flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-black/20 text-[15px] font-extrabold uppercase tracking-wide text-white"
          >
            👑 Unlimited hearts with Premium
          </Link>
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

const LOADING_TIPS = [
  "Tip: press 1–9 to pick an answer and Enter to check it.",
  "Tip: answers you miss come back at the end of the lesson.",
  "Tip: practise an old lesson to win back a heart.",
  "Tip: a Streak Freeze keeps your streak safe for a day.",
  "Tip: finish a skill, then try it in Legendary mode!",
];

function LessonLoading() {
  const [tip] = useState(() => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Mascot mood="think" className="h-32 w-32 animate-float" />
      <p className="font-extrabold uppercase tracking-wide text-faint">Loading…</p>
      <p className="max-w-xs font-bold text-muted">{tip}</p>
    </div>
  );
}

function LoadError({ error }: { error: ApiError }) {
  const outOfHearts = error.code === "out_of_hearts";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      {outOfHearts ? <HeartIcon className="h-24 w-24" dim /> : <Mascot mood="sad" className="h-32 w-32" />}
      <h1 className="text-2xl font-extrabold text-strong">
        {outOfHearts
          ? "You're out of hearts"
          : error.code === "lesson_locked" || error.code === "skill_not_completed"
            ? "This lesson is locked"
            : error.code === "already_legendary"
              ? "Already Legendary!"
              : "Couldn't start the lesson"}
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
