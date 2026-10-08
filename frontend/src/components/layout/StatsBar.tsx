"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FlameIcon, GemIcon, HeartIcon, XpIcon } from "@/components/ui/icons";
import { SpainFlag } from "@/components/ui/flags";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCountdown } from "@/lib/hooks";
import { useUser } from "@/lib/user-context";

type PanelKey = "course" | "streak" | "xp" | "gems" | "hearts";

/** Top stats row (course flag, streak, XP, gems, hearts), each opening a Duolingo-style dropdown. */
export function StatsBar({ compact = false }: { compact?: boolean }) {
  const { me } = useUser();
  const [open, setOpen] = useState<PanelKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!me) return <div className={compact ? "h-10" : "h-12"} />;

  const toggle = (key: PanelKey) => setOpen((current) => (current === key ? null : key));
  const item = "flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[15px] font-extrabold hover:bg-hover";

  return (
    <div ref={rootRef} className="relative flex items-center justify-between gap-1">
      <button className={item} onClick={() => toggle("course")} aria-label={`Course: ${me.course.title}`}>
        <SpainFlag className="h-6 w-8" />
      </button>
      <button
        className={`${item} ${me.streak_extended_today ? "text-fox" : "text-faint"}`}
        onClick={() => toggle("streak")}
        aria-label={`${me.streak} day streak`}
      >
        <FlameIcon className="h-6 w-6" dim={!me.streak_extended_today} />
        {me.streak}
      </button>
      <button className={`${item} text-bee-dark`} onClick={() => toggle("xp")} aria-label={`${me.xp_total} total XP`}>
        <XpIcon className="h-6 w-6" />
        {me.xp_total}
      </button>
      <button className={`${item} text-sky`} onClick={() => toggle("gems")} aria-label={`${me.gems} gems`}>
        <GemIcon className="h-6 w-6" />
        {me.gems}
      </button>
      <button className={`${item} text-cardinal`} onClick={() => toggle("hearts")} aria-label={`${me.hearts} hearts`}>
        <HeartIcon className="h-6 w-6" dim={me.hearts === 0 && !me.is_premium} />
        {me.is_premium ? "∞" : me.hearts}
      </button>

      {open && (
        <div className="animate-pop-in absolute right-0 top-full z-40 mt-3 w-full min-w-[300px] rounded-2xl border-2 border-line bg-panel p-5 shadow-lg">
          {open === "course" && <CoursePanel />}
          {open === "streak" && <StreakPanel />}
          {open === "xp" && <XpPanel />}
          {open === "gems" && <GemsPanel />}
          {open === "hearts" && <HeartsPanel onNavigate={() => setOpen(null)} />}
        </div>
      )}
    </div>
  );
}

function CoursePanel() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase text-faint">My courses</h3>
      <div className="flex items-center gap-3 rounded-xl border-2 border-sel-border bg-sel-bg p-3">
        <SpainFlag className="h-7 w-9" />
        <span className="font-extrabold text-strong">Spanish</span>
      </div>
      <Link href="/courses" className="mt-3 flex items-center gap-3 rounded-xl border-2 border-dashed border-line p-3 font-extrabold text-muted hover:bg-hover">
        <span className="flex h-7 w-9 items-center justify-center rounded-md bg-line text-lg">+</span>
        Add a new course
      </Link>
    </div>
  );
}

function StreakPanel() {
  const { me } = useUser();
  if (!me) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <h3 className="text-xl font-extrabold text-strong">{me.streak} day streak</h3>
        <p className="mt-1 text-sm text-muted">
          {me.streak_extended_today
            ? "You've extended your streak today. See you tomorrow!"
            : "Do a lesson today to extend your streak!"}
        </p>
        <p className="mt-2 text-sm font-bold text-sky">
          🧊 {me.streak_freezes} / {me.max_streak_freezes} streak freezes equipped
        </p>
      </div>
      <FlameIcon className="h-14 w-12" dim={!me.streak_extended_today} />
    </div>
  );
}

function XpPanel() {
  const { me } = useUser();
  if (!me) return null;
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <XpIcon className="h-12 w-12 shrink-0" />
        <div>
          <h3 className="text-xl font-extrabold text-strong">{me.xp_total} XP</h3>
          <p className="text-sm text-muted">Total experience earned</p>
        </div>
      </div>
      <p className="mb-2 text-sm font-bold text-strong">
        Daily goal: {Math.min(me.daily_xp, me.daily_goal_xp)} / {me.daily_goal_xp} XP
      </p>
      <ProgressBar value={me.daily_xp / me.daily_goal_xp} color="bee" />
    </div>
  );
}

function GemsPanel() {
  const { me } = useUser();
  if (!me) return null;
  return (
    <div className="flex items-center gap-4">
      <GemIcon className="h-14 w-14 shrink-0" />
      <div>
        <h3 className="text-xl font-extrabold text-strong">Gems</h3>
        <p className="mt-1 text-sm text-muted">You have {me.gems} gems.</p>
        <Link href="/shop" className="mt-2 inline-block text-sm font-extrabold uppercase text-sky">
          Go to shop
        </Link>
      </div>
    </div>
  );
}

function HeartsPanel({ onNavigate }: { onNavigate: () => void }) {
  const { me, nextHeartAt } = useUser();
  const countdown = useCountdown(nextHeartAt);
  if (!me) return null;
  return (
    <div>
      <h3 className="text-center text-xl font-extrabold text-strong">Hearts</h3>
      <div className="my-3 flex justify-center gap-1">
        {Array.from({ length: me.max_hearts }, (_, i) => (
          <HeartIcon key={i} className="h-8 w-8" dim={i >= me.hearts} />
        ))}
      </div>
      <p className="mb-4 text-center text-sm font-bold text-muted">
        {me.hearts >= me.max_hearts ? "You have full hearts" : `Next heart in ${countdown}`}
      </p>
      <div className="flex flex-col gap-2">
        <Link href="/shop" onClick={onNavigate}>
          <Button variant="outline" fullWidth size="sm" disabled={me.hearts >= me.max_hearts}>
            Refill hearts · <GemIcon className="h-4 w-4" /> {me.heart_refill_cost}
          </Button>
        </Link>
        <Link href="/practice" onClick={onNavigate}>
          <Button variant="outline" fullWidth size="sm">
            Practice to earn hearts
          </Button>
        </Link>
      </div>
    </div>
  );
}
