"use client";

import { Card, DailyGoalCard } from "@/components/layout/RightRail";
import { Mascot } from "@/components/ui/Mascot";

export default function QuestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl bg-beetle p-6 text-white">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">Daily Quests</h1>
          <p className="font-bold text-white/85">Complete quests to earn rewards. Quests reset every day.</p>
        </div>
        <Mascot mood="cheer" className="h-24 w-24 shrink-0" />
      </div>
      <DailyGoalCard />
      <Card className="text-center">
        <h2 className="mb-1 text-lg font-extrabold text-strong">Friends Quests</h2>
        <p className="text-muted">Coming soon!</p>
      </Card>
    </div>
  );
}
