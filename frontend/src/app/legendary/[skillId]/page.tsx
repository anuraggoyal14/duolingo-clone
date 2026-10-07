"use client";

import { useParams } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export default function LegendaryPage() {
  const { skillId } = useParams<{ skillId: string }>();
  return <LessonPlayer key={skillId} source={{ kind: "legendary", skillId: Number(skillId) }} />;
}
