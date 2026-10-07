"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { FlameIcon, GemIcon, XpIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import type { Completion } from "@/lib/types";

const CONFETTI_COLORS = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: React.ReactNode; color: string; icon: React.ReactNode }) {
  return (
    <div className="animate-pop-in flex-1 overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color }}>
      <p className="py-1 text-center text-xs font-extrabold uppercase tracking-wide text-white">{label}</p>
      <div className="flex items-center justify-center gap-2 rounded-xl bg-bg px-2 py-4 text-xl font-extrabold" style={{ color }}>
        {icon}
        {value}
      </div>
    </div>
  );
}

export function LessonCompleteScreen({ result, kind, onContinue }: { result: Completion; kind: "lesson" | "practice"; onContinue: () => void }) {
  const title = result.perfect && kind === "lesson" ? "Perfect lesson!" : kind === "practice" ? "Practice complete!" : "Lesson complete!";
  return (
    <div className="relative flex min-h-screen flex-col">
      <Confetti />
      <div className="relative z-[1] mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center">
        <Mascot mood="cheer" className="h-44 w-44 animate-float" />
        <div>
          <h1 className="text-3xl font-extrabold text-bee">{title}</h1>
          {result.skill_completed && (
            <p className="mt-2 text-lg font-bold text-muted">You finished the “{result.skill_title}” skill!</p>
          )}
          {kind === "practice" && <p className="mt-2 text-lg font-bold text-muted">You earned a heart back ❤️</p>}
        </div>
        <div className="flex w-full max-w-md gap-3">
          <StatCard label="Total XP" value={result.xp_earned} color="#ffc800" icon={<XpIcon className="h-6 w-6" />} />
          <StatCard
            label={result.accuracy >= 90 ? "Amazing" : result.accuracy >= 70 ? "Good" : "Accuracy"}
            value={`${result.accuracy}%`}
            color="#58cc02"
            icon={null}
          />
          {result.gems_earned > 0 && (
            <StatCard label="Gems" value={result.gems_earned} color="#1cb0f6" icon={<GemIcon className="h-6 w-6" />} />
          )}
        </div>
        {result.daily_goal_reached_now && (
          <p className="rounded-2xl border-2 border-bee px-4 py-2 font-extrabold text-fox">🎯 Daily goal reached: {result.daily_goal_xp} XP!</p>
        )}
      </div>
      <footer className="relative z-[1] border-t-2 border-line">
        <div className="mx-auto flex max-w-[1000px] justify-end px-4 py-5 sm:py-8">
          <Button onClick={onContinue} className="w-full sm:w-auto sm:min-w-[150px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}

export function StreakScreen({ streak, today, onContinue }: { streak: number; today?: string; onContinue: () => void }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  // Use the learner's local date from the server (respects their timezone and simulated days).
  const date = today ? new Date(`${today}T00:00:00`) : new Date();
  const todayIndex = (date.getDay() + 6) % 7;
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <FlameIcon className="animate-flame h-40 w-32" />
        <div className="animate-pop-in">
          <p className="text-[96px] font-black leading-none text-fox">{streak}</p>
          <p className="text-3xl font-extrabold text-fox">day streak!</p>
        </div>
        <div className="flex gap-3 rounded-2xl border-2 border-line px-5 py-4">
          {days.map((d, i) => {
            const lit = i <= todayIndex && todayIndex - i < streak;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={`text-sm font-extrabold ${i === todayIndex ? "text-fox" : "text-faint"}`}>{d}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${lit ? "bg-fox text-white" : "bg-line"}`}>
                  {lit && "✓"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="max-w-xs font-bold text-muted">Practice each day so your streak won&apos;t reset!</p>
      </div>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-[1000px] justify-end px-4 py-5 sm:py-8">
          <Button onClick={onContinue} className="w-full sm:w-auto sm:min-w-[150px]" autoFocus>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}
