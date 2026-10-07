"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CrownIcon, LockIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";
import type { Skill, UnitColor } from "@/lib/types";
import { UNIT_THEME } from "./unitTheme";

// Horizontal offsets (px) that produce the winding path.
const OFFSETS = [0, 45, 70, 45, 0, -45, -70, -45];

interface PathNodeProps {
  skill: Skill;
  index: number; // position across the whole course, drives the winding offset
  color: UnitColor;
  isLastInUnit: boolean;
}

export function PathNode({ skill, index, color, isLastInUnit }: PathNodeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = UNIT_THEME[color];
  const isActive = skill.status === "active";
  const isLocked = skill.status === "locked";
  const isCompleted = skill.status === "completed";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const progress = skill.total_lessons ? skill.lessons_completed / skill.total_lessons : 0;
  const Icon = isLocked ? LockIcon : isCompleted ? CheckIcon : isLastInUnit ? TrophyIcon : StarIcon;

  return (
    <div ref={ref} className={`relative flex justify-center ${isActive ? "mb-3 mt-10" : ""} ${open ? "z-20" : ""}`} style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}>
      {isActive && !open && (
        <div className="animate-bounce-soft absolute -top-12 left-1/2 z-10 whitespace-nowrap rounded-xl border-2 border-line bg-panel px-3 py-2.5 text-[15px] font-extrabold uppercase tracking-wide shadow-sm">
          <span className={theme.text}>{skill.lessons_completed === 0 ? "Start" : "Continue"}</span>
          <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-panel" />
        </div>
      )}

      <div className="relative">
        {isActive && <ProgressRing progress={progress} color={theme.hex} />}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={`${skill.title}: ${skill.status}`}
          aria-expanded={open}
          className={[
            "relative z-[1] flex h-[57px] w-[70px] items-center justify-center rounded-[50%] transition-transform active:translate-y-[6px]",
            isLocked ? "bg-locked text-faint" : `${theme.bg} text-white`,
          ].join(" ")}
          style={{
            boxShadow: `0 8px 0 ${isLocked ? "var(--locked-shadow)" : theme.lipHex}`,
          }}
        >
          <Icon className="h-8 w-8" />
        </button>
        {isCompleted && (
          <CrownIcon className="absolute -right-3 -top-3 z-[2] h-7 w-7 drop-shadow" />
        )}
      </div>

      {open && <NodePopover skill={skill} color={color} />}
    </div>
  );
}

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const size = 102;
  const r = 46;
  const circumference = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-4px)] -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  );
}

function NodePopover({ skill, color }: { skill: Skill; color: UnitColor }) {
  const theme = UNIT_THEME[color];
  const locked = skill.status === "locked";
  const completed = skill.status === "completed";
  const lessonNumber = Math.min(skill.lessons_completed + 1, skill.total_lessons);

  return (
    <div className="animate-pop-in absolute top-[82px] z-20 w-[300px]">
      <div
        className={`mx-auto h-4 w-4 translate-y-2 rotate-45 ${locked ? "border-l-2 border-t-2 border-line bg-hover" : theme.bg}`}
      />
      <div className={`rounded-2xl p-4 ${locked ? "border-2 border-line bg-hover" : `${theme.bg} text-white`}`}>
        <h3 className={`text-lg font-extrabold ${locked ? "text-faint" : ""}`}>{skill.title}</h3>
        <p className={`mb-3 font-bold ${locked ? "text-faint" : "text-white/85"}`}>
          {locked
            ? "Complete all levels above to unlock this!"
            : completed
              ? "You've completed this skill. Practice to keep it fresh!"
              : `Lesson ${lessonNumber} of ${skill.total_lessons}`}
        </p>
        {locked ? (
          <div className="flex h-12 w-full items-center justify-center rounded-2xl bg-locked text-[15px] font-extrabold uppercase text-faint">
            Locked
          </div>
        ) : (
          <Link
            href={completed ? "/practice" : `/lesson/${skill.next_lesson_id}`}
            className={`flex h-12 w-full items-center justify-center rounded-2xl border-b-4 border-[#e5e5e5] bg-white text-[15px] font-extrabold uppercase tracking-wide active:translate-y-[2px] active:border-b-2 ${theme.text}`}
          >
            {completed ? "Practice +10 XP" : "Start +10 XP"}
          </Link>
        )}
      </div>
    </div>
  );
}
