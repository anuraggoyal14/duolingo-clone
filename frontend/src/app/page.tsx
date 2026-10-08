import Link from "next/link";
import { Diego, Lucia, Sofia } from "@/components/art";
import { LinkButton } from "@/components/ui/Button";
import {
  ChestIcon,
  FlameIcon,
  GemIcon,
  HeartIcon,
  ShieldNavIcon,
  SpeakerIcon,
  TrophyIcon,
  XpIcon,
} from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { HeroCast } from "@/components/landing/HeroCast";
import { COURSE_CATALOG } from "@/lib/courses";

const FEATURES = [
  {
    title: "bite-sized. fun. effective.",
    body: "Each lesson takes a few minutes and mixes picture cards, word banks, matching, fill-in-the-blank and typing. Earn XP for every lesson and watch your progress ring fill up.",
    art: (
      <div className="relative flex items-center justify-center">
        <Mascot mood="cheer" className="h-48 w-48 animate-float" />
        <XpIcon className="absolute -right-2 top-4 h-14 w-14 rotate-12" />
        <GemIcon className="absolute -left-4 bottom-6 h-12 w-12 -rotate-12" />
      </div>
    ),
  },
  {
    title: "built around how you learn",
    body: "Hear every Spanish sentence, get instant feedback after each answer, and see the questions you missed come back at the end of the lesson until they stick.",
    art: (
      <div className="relative flex items-end justify-center gap-2">
        <Sofia mood="happy" className="h-48 w-auto" />
        <Mascot mood="think" className="h-36 w-36" />
        <span className="absolute -right-4 top-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-white shadow-[0_4px_0_#1899d6]">
          <SpeakerIcon className="h-8 w-8" />
        </span>
      </div>
    ),
  },
  {
    title: "stay motivated",
    body: "Keep your streak alive, climb the weekly league, open daily-quest chests and unlock achievements. Try a timed Legendary challenge to turn a skill gold.",
    art: (
      <div className="flex items-end justify-center gap-4">
        <FlameIcon className="h-28 w-24 animate-flame" />
        <ShieldNavIcon className="h-24 w-24" />
        <ChestIcon className="h-20 w-20" />
      </div>
    ),
  },
  {
    title: "learn at your own pace",
    body: "Pick a daily goal that fits your day, protect your streak with a Streak Freeze, and practise old lessons whenever you want to win back hearts.",
    art: (
      <div className="flex items-end justify-center gap-3">
        <Diego mood="happy" className="h-44 w-auto" />
        <HeartIcon className="mb-16 h-20 w-20 animate-float" />
        <Lucia mood="happy" className="h-40 w-auto" />
        <TrophyIcon className="mb-6 h-16 w-16 text-bee" />
      </div>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-2 border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[988px] items-center justify-between px-4">
          <Link href="/" className="text-[32px] font-black tracking-tight text-owl">
            duolingo
          </Link>
          <span className="hidden text-sm font-extrabold uppercase tracking-wide text-faint sm:inline">
            Site language: English
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-[988px] flex-col items-center gap-10 px-4 py-14 md:flex-row md:py-20">
        <div className="flex flex-1 justify-center">
          <HeroCast />
        </div>
        <div className="flex flex-1 flex-col items-center text-center">
          <h1 className="mb-8 max-w-[480px] text-[28px] font-extrabold leading-tight text-strong md:text-[32px]">
            Learn a new language in a few playful minutes a day, completely free!
          </h1>
          <div className="flex w-full max-w-[330px] flex-col gap-3">
            <LinkButton href="/courses" size="lg" fullWidth>
              Get started
            </LinkButton>
            <LinkButton href="/learn" variant="outline" size="lg" fullWidth>
              I already have an account
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Language strip */}
      <nav aria-label="Courses" className="border-y-2 border-line">
        <div className="mx-auto flex max-w-[988px] gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COURSE_CATALOG.map(({ code, name, Flag }) => (
            <Link
              key={code}
              href="/courses"
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-extrabold uppercase tracking-wide text-muted hover:bg-hover"
            >
              <Flag className="h-6 w-8" />
              {name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Feature sections */}
      <main className="mx-auto max-w-[988px] px-4">
        {FEATURES.map((feature, i) => (
          <section
            key={feature.title}
            className={`flex flex-col items-center gap-10 border-b-2 border-line py-16 md:gap-16 ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div className="flex-1">
              <h2 className="mb-4 text-[32px] font-extrabold leading-tight text-owl md:text-[44px]">{feature.title}</h2>
              <p className="text-lg leading-relaxed text-muted">{feature.body}</p>
            </div>
            <div className="flex flex-1 justify-center">{feature.art}</div>
          </section>
        ))}

        <section className="flex flex-col items-center gap-8 py-20 text-center">
          <h2 className="text-[32px] font-extrabold text-owl md:text-[44px]">learn anytime, anywhere.</h2>
          <p className="max-w-lg text-lg text-muted">
            Your streak, XP and progress are saved, so you can pick up right where you left off.
          </p>
          <LinkButton href="/courses" size="lg" className="min-w-[280px]">
            Get started
          </LinkButton>
        </section>
      </main>

      <footer className="bg-owl text-white">
        <div className="mx-auto grid max-w-[988px] grid-cols-2 gap-8 px-4 py-12 text-sm font-bold sm:grid-cols-4">
          {[
            ["About", ["Course catalogue", "Mission", "Approach"]],
            ["Learn", ["Spanish", "Leaderboards", "Daily quests"]],
            ["Help", ["FAQ", "Status", "Contact"]],
            ["Legal", ["Terms", "Privacy", "Guidelines"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <h3 className="mb-3 text-lg font-extrabold">{heading}</h3>
              <ul className="flex flex-col gap-2 text-white/85">
                {(links as string[]).map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-white/20 py-4 text-center text-xs font-bold text-white/80">
          A learning project. Not affiliated with Duolingo, Inc.
        </p>
      </footer>
    </div>
  );
}
