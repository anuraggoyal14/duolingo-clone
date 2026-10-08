"use client";

import Link from "next/link";
import { useState } from "react";
import { PremiumPromo } from "@/components/premium/PremiumPromo";
import { Button } from "@/components/ui/Button";
import { DumbbellIcon, GemIcon, HeartIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { useCountdown } from "@/lib/hooks";
import type { Me } from "@/lib/types";
import { useUser } from "@/lib/user-context";

export default function ShopPage() {
  const { me, setMe, nextHeartAt } = useUser();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const countdown = useCountdown(nextHeartAt);
  if (!me) return null;

  const full = me.hearts >= me.max_hearts;
  const affordable = me.gems >= me.heart_refill_cost;

  const freezesFull = me.streak_freezes >= me.max_streak_freezes;

  const purchase = async (action: () => Promise<Me>, message: string, icon: React.ReactNode) => {
    setBusy(true);
    try {
      setMe(await action());
      toast(message, { tone: "success", icon });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Purchase failed", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };
  const refill = () => purchase(api.refillHearts, "Hearts refilled!", <HeartIcon className="h-5 w-5" />);
  const buyFreeze = () => purchase(api.buyStreakFreeze, "Streak Freeze equipped!", <span>🧊</span>);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-strong">Shop</h1>
      <h2 className="mb-2 text-xl font-extrabold text-strong">Hearts</h2>

      <ShopRow
        icon={<HeartIcon className="h-14 w-14" />}
        title="Refill hearts"
        description={full ? "You have full hearts." : `Get full hearts so you can worry less about making mistakes. Next free heart in ${countdown}.`}
        action={
          <Button variant="outline" onClick={refill} disabled={busy || full || !affordable} className="min-w-[120px]">
            {full ? "Full" : (
              <>
                <GemIcon className="h-5 w-5" /> {me.heart_refill_cost}
              </>
            )}
          </Button>
        }
      />
      <ShopRow
        icon={<DumbbellIcon className="h-14 w-14 text-sky" />}
        title="Practice to earn hearts"
        description="Review lessons you've completed. Practice never costs hearts and earns one back."
        action={
          <Link href="/practice">
            <Button variant="outline" className="min-w-[120px]">
              Practice
            </Button>
          </Link>
        }
      />
      {!affordable && !full && (
        <p className="mt-2 font-bold text-cardinal">You need {me.heart_refill_cost - me.gems} more gems. Complete skills to earn gems!</p>
      )}

      <h2 className="mb-2 mt-10 text-xl font-extrabold text-strong">Power-ups</h2>
      <ShopRow
        icon={<span className="text-5xl">🧊</span>}
        title="Streak Freeze"
        description={`Keeps your streak in place for one full day of inactivity. ${me.streak_freezes} / ${me.max_streak_freezes} equipped.`}
        action={
          <Button
            variant="outline"
            onClick={buyFreeze}
            disabled={busy || freezesFull || me.gems < me.streak_freeze_cost}
            className="min-w-[120px]"
          >
            {freezesFull ? "Equipped" : (
              <>
                <GemIcon className="h-5 w-5" /> {me.streak_freeze_cost}
              </>
            )}
          </Button>
        }
      />
      <div className="mt-10">
        <PremiumPromo />
      </div>
    </div>
  );
}

function ShopRow({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-t-2 border-line py-5">
      <div className="flex w-16 shrink-0 justify-center">{icon}</div>
      <div className="flex-1">
        <h3 className="text-lg font-extrabold text-strong">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
