"use client";

import Link from "next/link";
import { HeartIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { useUser } from "@/lib/user-context";

/** "Get Premium" card with an animated gradient. Shows a member badge once Premium is active. */
export function PremiumPromo({ compact = false }: { compact?: boolean }) {
  const { me } = useUser();
  if (!me) return null;

  if (me.is_premium) {
    return (
      <Link href="/premium" className="premium-gradient flex shrink-0 items-center gap-3 rounded-2xl p-4 text-white shadow-md">
        <span className="text-2xl">👑</span>
        <span className="flex-1 font-extrabold">Premium active · unlimited hearts</span>
      </Link>
    );
  }

  return (
    <Link
      href="/premium"
      className="premium-gradient premium-shine group block shrink-0 rounded-2xl p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Mascot mood="cheer" className={compact ? "h-14 w-14" : "h-20 w-20"} />
          <span className="absolute -right-1 -top-2 text-2xl drop-shadow">👑</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Premium</p>
          <h2 className="text-lg font-extrabold leading-tight">Learn without limits</h2>
          {!compact && (
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-white/90">
              <HeartIcon className="h-4 w-4" /> Unlimited hearts · keep your flow
            </p>
          )}
        </div>
      </div>
      <span className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl border-b-4 border-black/20 bg-white text-[15px] font-extrabold uppercase tracking-wide text-[#7c3aed] group-active:translate-y-[2px] group-active:border-b-2">
        Get Premium
      </span>
    </Link>
  );
}
