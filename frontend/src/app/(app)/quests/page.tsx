"use client";

import { Card } from "@/components/layout/RightRail";
import { DailyQuests } from "@/components/layout/DailyQuests";
import { Mascot } from "@/components/ui/Mascot";

export default function QuestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl bg-beetle p-6 text-white">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">Daily Quests</h1>
          <p className="font-bold text-white/85">
            Complete quests to open chests full of gems. New quests every day at midnight.
          </p>
        </div>
        <Mascot mood="cheer" className="h-24 w-24 shrink-0" />
      </div>
      <Card>
        <h2 className="mb-4 text-xl font-extrabold text-strong">Today&apos;s quests</h2>
        <DailyQuests />
      </Card>
      <Card className="text-center">
        <h2 className="mb-1 text-lg font-extrabold text-strong">Friends Quests</h2>
        <p className="text-muted">Coming soon!</p>
      </Card>
    </div>
  );
}
