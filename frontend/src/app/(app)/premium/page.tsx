"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/lesson/Celebration";
import { Button } from "@/components/ui/Button";
import { FlameIcon, HeartIcon, TrophyIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { loadRazorpay, openCheckout } from "@/lib/razorpay";
import type { PremiumStatus } from "@/lib/types";
import { useUser } from "@/lib/user-context";

const BENEFITS = [
  { icon: <HeartIcon className="h-8 w-8" />, title: "Unlimited hearts", body: "Make mistakes freely; you'll never run out mid-lesson." },
  { icon: <TrophyIcon className="h-8 w-8 text-bee" />, title: "Go Legendary anytime", body: "Practise and push for gold without worrying about hearts." },
  { icon: <FlameIcon className="h-8 w-7" />, title: "Protect your progress", body: "Keep your streak and learning flow going every day." },
];

type Phase = "idle" | "creating" | "checkout" | "verifying" | "success";

export default function PremiumPage() {
  const { me, setMe } = useUser();
  const toast = useToast();
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    api.premium().then(setStatus).catch(() => setStatus(null));
    loadRazorpay(); // warm up the checkout script so the payment window opens instantly
  }, [me?.is_premium]);

  const buy = async () => {
    if (!me) return;
    setPhase("creating");
    try {
      const [order, loaded] = await Promise.all([api.createPremiumOrder(), loadRazorpay()]);
      if (!loaded) throw new ApiError(0, "checkout_unavailable", "Couldn't load the payment window. Check your connection.");
      setPhase("checkout");
      const result = await openCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Lingo Premium",
        description: order.description,
        order_id: order.order_id,
        prefill: { name: order.customer_name },
        theme: { color: "#7c3aed" },
      });
      if (result.status === "dismissed") {
        toast("Payment cancelled", { tone: "info" });
        setPhase("idle");
        return;
      }
      if (result.status === "failed") {
        toast(result.message, { tone: "error" });
        setPhase("idle");
        return;
      }
      setPhase("verifying");
      setMe(await api.verifyPremium(result.response));
      setPhase("success");
      toast("Welcome to Premium!", { tone: "success", icon: <span>👑</span> });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Something went wrong with the payment", { tone: "error" });
      setPhase("idle");
    }
  };

  const premiumUntil = me?.premium_until ? new Date(me.premium_until + "Z").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : null;
  const busy = phase === "creating" || phase === "checkout" || phase === "verifying";

  return (
    <div className="flex flex-col gap-6">
      {phase === "success" && <Confetti />}

      <section className="premium-gradient premium-shine relative overflow-hidden rounded-3xl px-6 pb-8 pt-8 text-center text-white shadow-xl">
        <div className="relative mx-auto mb-2 w-fit">
          <Mascot mood="cheer" className="h-32 w-32 animate-float" />
          <span className="absolute -right-2 -top-1 text-4xl drop-shadow">👑</span>
        </div>
        <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-white/80">Premium</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">Learn without limits</h1>
        <p className="mx-auto mt-2 max-w-sm font-bold text-white/90">
          Unlimited hearts for {status?.days ?? 30} days. One simple payment, no auto-renewal.
        </p>
      </section>

      <ul className="flex flex-col gap-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="flex items-center gap-4 rounded-2xl border-2 border-line p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-hover">{benefit.icon}</span>
            <div>
              <h3 className="font-extrabold text-strong">{benefit.title}</h3>
              <p className="text-sm text-muted">{benefit.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border-2 border-[#ce82ff] p-5 text-center">
        {me?.is_premium ? (
          <>
            <p className="text-2xl font-black text-[#7c3aed]">👑 You&apos;re Premium!</p>
            <p className="mt-1 font-bold text-muted">Unlimited hearts until {premiumUntil}.</p>
            <p className="mt-3 text-sm text-muted">Buying again adds another {status?.days ?? 30} days.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-extrabold uppercase tracking-wide text-muted">{status?.days ?? 30}-day pass</p>
            <p className="mt-1 text-4xl font-black text-strong">
              ₹{status?.price_inr ?? 499}
              <span className="text-base font-bold text-muted"> one-time</span>
            </p>
          </>
        )}
        <Button
          variant="super"
          fullWidth
          size="lg"
          className="mt-5"
          onClick={buy}
          disabled={busy || status?.payments_enabled === false}
        >
          {phase === "creating"
            ? "Preparing checkout…"
            : phase === "checkout"
              ? "Complete payment in Razorpay…"
              : phase === "verifying"
                ? "Verifying payment…"
                : me?.is_premium
                  ? `Extend Premium · ₹${status?.price_inr ?? 499}`
                  : `Get Premium · ₹${status?.price_inr ?? 499}`}
        </Button>
        {status?.payments_enabled === false && (
          <p className="mt-3 text-sm font-bold text-cardinal">Payments aren&apos;t configured on this server yet.</p>
        )}
        <p className="mt-4 text-xs font-bold text-faint">
          🔒 Secure payment by Razorpay · Test mode: use card 4111 1111 1111 1111, any future date and CVV
        </p>
      </section>
    </div>
  );
}
