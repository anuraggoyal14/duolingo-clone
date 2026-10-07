"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CrownIcon, FlameIcon, ShieldNavIcon, XpIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { api, ApiError } from "@/lib/api";
import type { Achievement, Profile } from "@/lib/types";
import { useUser } from "@/lib/user-context";

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  footprints: "👣",
  flame: "🔥",
  sparkles: "✨",
  book: "📚",
  target: "🎯",
  crown: "👑",
  medal: "🏅",
};

export default function ProfilePage() {
  const { me } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.profile().then(setProfile).catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load profile."));
  }, [me?.xp_total]);

  if (error) return <p className="pt-20 text-center font-bold text-muted">{error}</p>;
  if (!profile) return <div className="h-96 animate-pulse rounded-2xl bg-line" />;

  const { user } = profile;
  const joined = new Date(profile.joined_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const maxDay = Math.max(...profile.xp_last_7_days.map((d) => d.xp), 10);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center gap-5 border-b-2 border-line pb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-strong">{user.display_name}</h1>
          <p className="text-muted">@{user.username}</p>
          <p className="mt-2 text-sm font-bold text-muted">Joined {joined}</p>
          <Link href="/settings" className="mt-3 inline-block text-sm font-extrabold uppercase text-sky">
            Edit profile
          </Link>
        </div>
        <Avatar name={user.display_name} color={user.avatar_color} size={96} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-strong">Statistics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<FlameIcon className="h-7 w-7" dim={!user.streak_extended_today} />} value={user.streak} label="Day streak" />
          <Stat icon={<XpIcon className="h-7 w-7" />} value={user.xp_total} label="Total XP" />
          <Stat icon={<ShieldNavIcon className="h-7 w-7" />} value={profile.league} label="Current league" />
          <Stat icon={<CrownIcon className="h-7 w-7" />} value={profile.skills_completed} label="Skills completed" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-strong">XP this week</h2>
        <div className="rounded-2xl border-2 border-line p-5">
          <div className="flex h-36 items-end gap-3" role="img" aria-label="XP earned in the last 7 days">
            {profile.xp_last_7_days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold text-muted">{day.xp || ""}</span>
                <div
                  className={`w-full rounded-t-lg ${day.date === user.today ? "bg-fox" : "bg-bee"}`}
                  style={{ height: `${Math.max((day.xp / maxDay) * 100, day.xp ? 6 : 2)}px` }}
                />
                <span className="text-xs font-extrabold uppercase text-faint">
                  {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-muted">
            {profile.lessons_completed} lessons completed · {profile.perfect_lessons} perfect · longest streak {user.longest_streak} days
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-strong">Achievements</h2>
        <div className="rounded-2xl border-2 border-line">
          {profile.achievements.map((a) => (
            <AchievementRow key={a.code} achievement={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-line px-4 py-3">
      {icon}
      <div>
        <p className="text-lg font-extrabold leading-tight text-strong">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

function AchievementRow({ achievement: a }: { achievement: Achievement }) {
  const unlocked = !!a.unlocked_at;
  return (
    <div className="flex items-center gap-4 border-b-2 border-line p-4 last:border-0">
      <span
        className={`flex h-16 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${unlocked ? "bg-bee" : "bg-line grayscale"}`}
        aria-hidden
      >
        {ACHIEVEMENT_EMOJI[a.icon] ?? "🏆"}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-strong">{a.title}</h3>
          <span className="text-sm font-bold text-muted">
            {a.progress}/{a.threshold}
          </span>
        </div>
        <ProgressBar value={a.progress / a.threshold} color="bee" className="my-1.5 h-3" />
        <p className="text-sm text-muted">{a.description}</p>
      </div>
    </div>
  );
}
