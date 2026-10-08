"use client";

import { useEffect, useState } from "react";

/** Live mm:ss / h:mm:ss countdown to an absolute deadline (epoch ms). */
export function useCountdown(deadline: number | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline == null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (deadline == null) return "";
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Animates a number from 0 up to `target` (ease-out), starting after `delayMs`. */
export function useCountUp(target: number, durationMs = 900, delayMs = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const tick = (time: number) => {
        start ??= time;
        const t = Math.min(1, (time - start) / durationMs);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, delayMs]);

  return value;
}
