"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import type { Me } from "./types";

interface UserState {
  me: Me | null;
  error: ApiError | null;
  /** Epoch ms when the next heart regenerates (fixed at fetch time), or null when full. */
  nextHeartAt: number | null;
  /** Re-fetch the learner (stats change after lessons, purchases, time passing). */
  refresh: () => Promise<void>;
  /** Replace the learner with a response that already contains the fresh state. */
  setMe: (me: Me) => void;
}

const UserContext = createContext<UserState | null>(null);

const RETRY_DELAYS_MS = [1500, 3000, 5000, 8000];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [me, setMeState] = useState<Me | null>(null);
  const [nextHeartAt, setNextHeartAt] = useState<number | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const setMe = useCallback((data: Me) => {
    setMeState(data);
    setNextHeartAt(data.next_heart_in_seconds == null ? null : Date.now() + data.next_heart_in_seconds * 1000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setMe(await api.me());
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, "unknown", String(e)));
    }
  }, [setMe]);

  // Initial load with retries: a sleeping free-tier backend may need a few seconds to boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length && !cancelled; attempt++) {
        try {
          const data = await api.me();
          if (!cancelled) {
            setMe(data);
            setError(null);
          }
          return;
        } catch (e) {
          if (cancelled) return;
          setError(e instanceof ApiError ? e : new ApiError(0, "unknown", String(e)));
          if (attempt < RETRY_DELAYS_MS.length) {
            await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setMe]);

  // Hearts regenerate on the server over time; refresh when the next heart is due.
  useEffect(() => {
    if (nextHeartAt == null) return;
    const delayMs = Math.min(Math.max(nextHeartAt - Date.now() + 1000, 5000), 30 * 60_000);
    const timer = setTimeout(refresh, delayMs);
    return () => clearTimeout(timer);
  }, [nextHeartAt, refresh]);

  return <UserContext.Provider value={{ me, error, nextHeartAt, refresh, setMe }}>{children}</UserContext.Provider>;
}

export function useUser(): UserState {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
