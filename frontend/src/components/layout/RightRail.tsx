"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldNavIcon } from "@/components/ui/icons";
import { api } from "@/lib/api";
import type { Leaderboard } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { DailyQuestsCard } from "./DailyQuests";
import { StatsBar } from "./StatsBar";
import { PremiumPromo } from "@/components/premium/PremiumPromo";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border-2 border-line p-5 ${className}`}>{children}</section>;
}

function LeagueCard() {
  const { me } = useUser();
  const [board, setBoard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    api.leaderboard().then(setBoard).catch(() => setBoard(null));
  }, [me?.xp_total]);

  const mine = board?.entries.find((e) => e.is_current_user);
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-strong">{board?.league ?? "Bronze"} League</h2>
        <Link href="/leaderboard" className="text-sm font-extrabold uppercase text-sky">
          View league
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ShieldNavIcon className="h-12 w-12 shrink-0" />
        <p className="text-muted">
          {mine ? (
            <>
              You&apos;re ranked <span className="font-extrabold text-strong">#{mine.rank}</span> with{" "}
              <span className="font-extrabold text-strong">{mine.weekly_xp} XP</span> this week.
            </>
          ) : (
            "Complete a lesson to join this week's league."
          )}
        </p>
      </div>
    </Card>
  );
}

/** Desktop right column: stats, league, daily quests. */
export function RightRail() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[368px] shrink-0 flex-col gap-6 overflow-y-auto py-6 xl:flex [&>*]:shrink-0">
      <StatsBar />
      <PremiumPromo />
      <LeagueCard />
      <DailyQuestsCard />
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 text-xs font-bold uppercase text-faint">
        <span>About</span>
        <span>Help</span>
        <span>Privacy</span>
        <span>Terms</span>
      </footer>
    </aside>
  );
}
