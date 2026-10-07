"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BookIcon } from "@/components/ui/icons";
import { Mascot } from "@/components/ui/Mascot";
import { Modal } from "@/components/ui/Modal";
import type { Unit } from "@/lib/types";
import { PathNode } from "./PathNode";
import { UNIT_THEME } from "./unitTheme";

export function LearningPath({ units }: { units: Unit[] }) {
  let globalIndex = 0;
  return (
    <div className="flex flex-col gap-10">
      {units.map((unit, unitIndex) => {
        const startIndex = globalIndex;
        globalIndex += unit.skills.length;
        return <UnitSection key={unit.id} unit={unit} startIndex={startIndex} mascotLeft={unitIndex % 2 === 1} />;
      })}
    </div>
  );
}

function UnitSection({ unit, startIndex, mascotLeft }: { unit: Unit; startIndex: number; mascotLeft: boolean }) {
  const theme = UNIT_THEME[unit.color];
  const [guideOpen, setGuideOpen] = useState(false);
  const unitDone = unit.skills.every((s) => s.status === "completed");

  return (
    <section aria-labelledby={`unit-${unit.id}`}>
      <div className={`sticky top-[58px] z-10 mb-14 flex items-center justify-between gap-3 rounded-2xl p-4 text-white xl:top-4 ${theme.bg} border-b-4 ${theme.lip}`}>
        <div>
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-white/80">
            Section 1, {unit.title}
          </p>
          <h2 id={`unit-${unit.id}`} className="text-xl font-extrabold leading-tight">
            {unit.description}
          </h2>
        </div>
        <button
          onClick={() => setGuideOpen(true)}
          className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 border-b-4 border-black/20 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wide hover:bg-white/10`}
        >
          <BookIcon /> <span className="hidden sm:inline">Guidebook</span>
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-10 pb-4">
        {unit.skills.map((skill, i) => (
          <PathNode
            key={skill.id}
            skill={skill}
            index={startIndex + i}
            color={unit.color}
            isLastInUnit={i === unit.skills.length - 1}
          />
        ))}
        <Mascot
          mood={unitDone ? "cheer" : "happy"}
          className={`pointer-events-none absolute top-16 hidden h-36 w-36 sm:block ${mascotLeft ? "left-2" : "right-2"} animate-float`}
        />
      </div>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} labelledBy={`guide-${unit.id}`}>
        <Mascot mood="think" className="mx-auto mb-3 h-24 w-24" />
        <h2 id={`guide-${unit.id}`} className="mb-2 text-2xl font-extrabold text-strong">
          {unit.title} Guidebook
        </h2>
        <p className="mb-2 text-muted">{unit.description}.</p>
        <ul className="mb-6 text-left font-bold text-strong">
          {unit.skills.map((s) => (
            <li key={s.id} className="flex justify-between border-b-2 border-line py-2 last:border-0">
              <span>{s.title}</span>
              <span className="text-muted">
                {s.lessons_completed}/{s.total_lessons} lessons
              </span>
            </li>
          ))}
        </ul>
        <Button variant="secondary" fullWidth onClick={() => setGuideOpen(false)}>
          Got it
        </Button>
      </Modal>
    </section>
  );
}
