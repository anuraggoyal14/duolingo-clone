import type {
  AnswerResult,
  AnswerValue,
  Attempt,
  Completion,
  CoursePath,
  Leaderboard,
  Me,
  Profile,
  Quests,
} from "./types";

/** Error carrying the backend's stable `error.code` (e.g. "out_of_hearts"). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const REQUEST_TIMEOUT_MS = 60_000; // generous: free-tier hosts can take a while to wake up

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
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

const post = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) });

export const api = {
  me: () => request<Me>("/me"),
  updateMe: (data: Partial<Pick<Me, "display_name" | "daily_goal_xp" | "timezone">>) =>
    request<Me>("/me", { method: "PATCH", body: JSON.stringify(data) }),
  profile: () => request<Profile>("/profile"),
  course: () => request<CoursePath>("/course"),
  leaderboard: () => request<Leaderboard>("/leaderboard"),

  startLesson: (lessonId: number) => post<Attempt>(`/lessons/${lessonId}/attempts`),
  startPractice: () => post<Attempt>("/practice/attempts"),
  startLegendary: (skillId: number) => post<Attempt>(`/skills/${skillId}/legendary`),
  answer: (attemptId: string, exerciseId: number, answer: AnswerValue) =>
    post<AnswerResult>(`/attempts/${attemptId}/answers`, { exercise_id: exerciseId, answer }),
  complete: (attemptId: string) => post<Completion>(`/attempts/${attemptId}/complete`),

  refillHearts: () => post<Me>("/shop/refill-hearts"),
  buyStreakFreeze: () => post<Me>("/shop/streak-freeze"),

  quests: () => request<Quests>("/quests"),
  claimQuest: (code: string) => post<Quests>(`/quests/${code}/claim`),

  advanceDay: (days = 1) => post<{ day_offset: number; today: string }>("/dev/advance-day", { days }),
  resetProgress: () => post<{ day_offset: number; today: string }>("/dev/reset"),
};
