"use client";

import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { COURSE_CATALOG } from "@/lib/courses";
import { useUser } from "@/lib/user-context";

/** Course picker: the seeded course is playable, the rest are "Coming soon" placeholders. */
export default function CoursesPage() {
  const router = useRouter();
  const toast = useToast();
  const { me } = useUser();
  const activeCode = me?.course.code;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-strong">Language courses for English speakers</h1>
      <p className="mb-6 text-muted">Pick a course to start learning. More languages are on the way!</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {COURSE_CATALOG.map(({ code, name, Flag }) => {
          const active = code === activeCode;
          return (
            <button
              key={code}
              type="button"
              onClick={() => (active ? router.push("/learn") : toast(`${name} is coming soon!`, { tone: "info" }))}
              className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 border-b-4 px-3 pb-5 pt-6 transition-colors active:translate-y-[2px] active:border-b-2 ${
                active ? "border-owl bg-correct-bg" : "border-line hover:bg-hover"
              }`}
            >
              {active && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-owl text-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
              <Flag className={`h-[66px] w-[88px] ${active ? "" : "opacity-80"}`} />
              <span className="font-extrabold text-strong">{name}</span>
              <span className={`text-xs font-extrabold uppercase tracking-wide ${active ? "text-owl-text" : "text-faint"}`}>
                {active ? "Current course" : "Coming soon"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
