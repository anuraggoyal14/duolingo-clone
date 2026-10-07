"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ShieldNavIcon } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/api";
import type { Leaderboard } from "@/lib/types";

const LEAGUE_COUNT = 5; // Bronze is unlocked; higher leagues are shown dimmed

export default function LeaderboardPage() {
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.leaderboard().then(setBoard).catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load the leaderboard."));
  }, []);

  if (error) return <p className="pt-20 text-center font-bold text-muted">{error}</p>;
  if (!board) return <div className="h-96 animate-pulse rounded-2xl bg-line" />;

  const demotionStart = board.entries.length - board.demotion_count;
  return (
    <div>
      <div className="mb-4 flex justify-center gap-4">
        {Array.from({ length: LEAGUE_COUNT }, (_, i) => (
          <span key={i} className={i === 0 ? "" : "opacity-40 grayscale"}>
            <ShieldNavIcon className={i === 0 ? "h-16 w-16" : "h-12 w-12"} />
          </span>
        ))}
      </div>
      <h1 className="text-center text-2xl font-extrabold text-strong">{board.league} League</h1>
      <p className="mb-1 text-center text-muted">Top {board.promotion_count} advance to the next league</p>
      <p className="mb-6 text-center font-extrabold text-fox">
        {board.days_left === 0 ? "Ends today" : `${board.days_left} day${board.days_left === 1 ? "" : "s"} left`}
      </p>

      <ol className="border-t-2 border-line">
        {board.entries.map((entry, i) => (
          <li key={entry.user_id}>
            {i === board.promotion_count && <ZoneDivider label="Promotion zone" color="text-owl" />}
            {i === demotionStart && i > board.promotion_count && <ZoneDivider label="Demotion zone" color="text-cardinal" />}
            <div
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                entry.is_current_user ? "bg-sel-bg" : "hover:bg-hover"
              }`}
            >
              <span
                className={`w-6 text-center text-lg font-extrabold ${
                  entry.rank === 1 ? "text-bee" : entry.rank === 2 ? "text-faint" : entry.rank === 3 ? "text-[#cd7f32]" : i < board.promotion_count ? "text-owl" : "text-muted"
                }`}
              >
                {entry.rank}
              </span>
              <Avatar name={entry.display_name} color={entry.avatar_color} />
              <span className={`flex-1 font-extrabold ${entry.is_current_user ? "text-sel-text" : "text-strong"}`}>
                {entry.display_name}
                {entry.is_current_user && " (you)"}
              </span>
              <span className="font-bold text-muted">{entry.weekly_xp} XP</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ZoneDivider({ label, color }: { label: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 py-2 text-sm font-extrabold uppercase ${color}`}>
      <span className="h-0.5 flex-1 bg-current opacity-40" />
      {label}
      <span className="h-0.5 flex-1 bg-current opacity-40" />
    </div>
  );
}
