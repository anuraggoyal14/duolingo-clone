"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeNavIcon,
  MoreNavIcon,
  ProfileNavIcon,
  QuestNavIcon,
  ShieldNavIcon,
  ShopNavIcon,
} from "@/components/ui/icons";

export const NAV_ITEMS = [
  { href: "/learn", label: "Learn", Icon: HomeNavIcon },
  { href: "/leaderboard", label: "Leaderboards", Icon: ShieldNavIcon },
  { href: "/quests", label: "Quests", Icon: QuestNavIcon },
  { href: "/shop", label: "Shop", Icon: ShopNavIcon },
  { href: "/profile", label: "Profile", Icon: ProfileNavIcon },
  { href: "/settings", label: "More", Icon: MoreNavIcon },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/learn" className={`text-[32px] font-black tracking-tight text-owl ${className}`}>
      duolingo
    </Link>
  );
}

/** Desktop/tablet left navigation (icons-only between md and lg). */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col border-r-2 border-line bg-bg px-3 py-6 md:flex lg:w-64 lg:px-4">
      <div className="mb-6 px-2 lg:px-4">
        <Logo className="hidden lg:block" />
        <Link href="/learn" className="block text-center text-3xl font-black text-owl lg:hidden" aria-label="Home">
          d
        </Link>
      </div>
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center justify-center gap-5 rounded-xl border-2 px-2 py-2 text-[15px] font-extrabold uppercase tracking-wide transition-colors lg:justify-start lg:px-4",
                active ? "border-sel-border bg-sel-bg text-sel-text" : "border-transparent text-muted hover:bg-hover",
              ].join(" ")}
            >
              <Icon className="h-8 w-8 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/** Mobile bottom tab bar. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-2 border-line bg-bg px-2 py-2 md:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`rounded-xl border-2 p-1.5 ${active ? "border-sel-border bg-sel-bg" : "border-transparent"}`}
          >
            <Icon className="h-7 w-7" />
          </Link>
        );
      })}
    </nav>
  );
}
