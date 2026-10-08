// Content manager API (/api/admin/*). Mirrors the "admin" section of backend/app/schemas.py.
// Unlike the learner API, exercises here carry their answer keys inside `content`.

import { ApiError } from "./api";

export type ExerciseType = "multiple_choice" | "translate" | "match_pairs" | "fill_blank" | "type_answer";

export interface AdminExercise {
  id: number;
  position: number;
  type: ExerciseType;
  prompt: string;
  /** Everything except type/prompt, answer key included. Shape depends on `type`. */
  content: Record<string, unknown>;
}

export interface AdminLesson {
  id: number;
  position: number;
  exercises: AdminExercise[];
}

export interface AdminSkill {
  id: number;
  position: number;
  title: string;
  icon: string;
  lessons: AdminLesson[];
}

export interface AdminUnit {
  id: number;
  position: number;
  title: string;
  description: string;
  color: string;
  skills: AdminSkill[];
}

export interface AdminContent {
  course: { code: string; title: string };
  units: AdminUnit[];
  totals: {
    units: number;
    skills: number;
    lessons: number;
    exercises: number;
    by_type: Record<ExerciseType, number>;
  };
}

export interface ExerciseUpdate {
  prompt?: string;
  content?: Record<string, unknown>;
}

const REQUEST_TIMEOUT_MS = 60_000;

// Same envelope handling as lib/api.ts: errors surface as ApiError with the backend's code
// (e.g. "invalid_exercise" carries a message explaining what's wrong with the payload).
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/admin${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, "network_error", "Can't reach the server. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "http_error",
      error?.message ?? `Request failed (${response.status})`,
    );
  }
  return body as T;
}

const patch = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });

export const adminApi = {
  content: () => request<AdminContent>("/content"),
  updateUnit: (id: number, data: { title?: string; description?: string }) =>
    patch<AdminUnit>(`/units/${id}`, data),
  updateSkill: (id: number, data: { title?: string }) => patch<AdminSkill>(`/skills/${id}`, data),
  updateExercise: (id: number, data: ExerciseUpdate) => patch<AdminExercise>(`/exercises/${id}`, data),
};
