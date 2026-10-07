"use client";

import { BottomNav, Sidebar } from "@/components/layout/Sidebar";
import { RightRail } from "@/components/layout/RightRail";
import { StatsBar } from "@/components/layout/StatsBar";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { useUser } from "@/lib/user-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { me, error, refresh } = useUser();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:pl-[88px] lg:pl-64">
        {/* Mobile/tablet stats bar (desktop shows it in the right rail) */}
        <header className="sticky top-0 z-20 border-b-2 border-line bg-bg px-4 py-2 xl:hidden">
          <div className="mx-auto max-w-[600px]">
            <StatsBar compact />
          </div>
        </header>
        <div className="mx-auto flex max-w-[1056px] justify-center gap-12 px-4 pb-24 md:px-6 md:pb-10">
          <main className="w-full max-w-[600px] min-w-0 pt-6">
            {me ? children : <BootState error={error?.message} onRetry={refresh} />}
          </main>
          <RightRail />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function BootState({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 pt-24 text-center">
      <Mascot mood={error ? "sad" : "think"} className="h-32 w-32 animate-float" />
      {error ? (
        <>
          <p className="max-w-xs font-bold text-muted">
            {error} The server may be waking up; this can take up to a minute on the free tier.
          </p>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </>
      ) : (
        <p className="font-bold text-muted">Loading…</p>
      )}
    </div>
  );
}
