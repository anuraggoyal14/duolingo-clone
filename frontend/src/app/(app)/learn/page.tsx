"use client";

import { useEffect, useState } from "react";
import { LearningPath } from "@/components/path/LearningPath";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { CoursePath } from "@/lib/types";

export default function LearnPage() {
  const [path, setPath] = useState<CoursePath | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    api
      .course()
      .then(setPath)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load your course."));
  };

  useEffect(load, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 text-center">
        <p className="font-bold text-muted">{error}</p>
        <Button variant="secondary" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }
  if (!path) return <PathSkeleton />;
  return <LearningPath units={path.units} />;
}

function PathSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading course">
      <div className="mb-14 h-[88px] rounded-2xl bg-line" />
      <div className="flex flex-col items-center gap-9">
        {[0, 45, 70, 45, 0].map((x, i) => (
          <div key={i} className="h-[57px] w-[70px] rounded-[50%] bg-line" style={{ transform: `translateX(${x}px)` }} />
        ))}
      </div>
    </div>
  );
}
