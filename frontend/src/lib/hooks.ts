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
