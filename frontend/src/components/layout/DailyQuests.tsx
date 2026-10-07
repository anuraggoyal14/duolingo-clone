"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChestIcon, GemIcon, XpIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import type { Quest } from "@/lib/types";
import { useUser } from "@/lib/user-context";

const QUEST_ICONS: Record<string, string> = {
  earn_xp: "⚡",
  complete_lessons: "📘",
  perfect_lesson: "🎯",
};

/** Today's three quests with progress bars and claimable chests. */
export function DailyQuests({ compact = false }: { compact?: boolean }) {
  const { me, refresh } = useUser();
  const toast = useToast();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Re-fetch whenever XP or the day changes (i.e. after lessons or simulated days).
  useEffect(() => {
    api.quests().then((q) => setQuests(q.quests)).catch(() => setQuests(null));
  }, [me?.xp_total, me?.today]);

  const claim = async (quest: Quest) => {
    setClaiming(quest.code);
    try {
      const updated = await api.claimQuest(quest.code);
      setQuests(updated.quests);
      toast(`Chest opened: +${quest.reward_gems} gems!`, { tone: "success", icon: <GemIcon className="h-5 w-5" /> });
      refresh();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Couldn't open the chest", { tone: "error" });
    } finally {
      setClaiming(null);
    }
  };

  if (!quests) return <div className={`animate-pulse rounded-xl bg-line ${compact ? "h-24" : "h-48"}`} />;

  return (
    <ul className="flex flex-col gap-4">
      {quests.map((quest) => (
        <li key={quest.code} className="flex items-center gap-3">
          {quest.code === "earn_xp" ? (
            <XpIcon className="h-9 w-9 shrink-0" />
          ) : (
            <span className="w-9 shrink-0 text-center text-2xl" aria-hidden>
              {QUEST_ICONS[quest.code] ?? "⭐"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 font-bold text-strong">{quest.title}</p>
            <ProgressBar
              value={quest.progress / quest.target}
              color="bee"
              className="h-5"
              label={`${quest.progress} / ${quest.target}`}
            />
          </div>
          {quest.completed && !quest.claimed ? (
            <button
              onClick={() => claim(quest)}
              disabled={claiming !== null}
              aria-label={`Open chest for ${quest.title}`}
              className="animate-bounce-soft-sm shrink-0 rounded-xl p-1 hover:bg-hover"
              title={`Claim ${quest.reward_gems} gems`}
            >
              <ChestIcon className="h-9 w-9" />
            </button>
          ) : (
            <ChestIcon className={`h-9 w-9 shrink-0 ${quest.claimed ? "opacity-30" : "opacity-60 grayscale"}`} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** Right-rail card version. */
export function DailyQuestsCard() {
  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-strong">Daily Quests</h2>
        <Link href="/quests" className="text-sm font-extrabold uppercase text-sky">
          View all
        </Link>
      </div>
      <DailyQuests compact />
    </section>
  );
}
