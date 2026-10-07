"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastTone = "success" | "error" | "info" | "achievement";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  icon?: React.ReactNode;
}

type ShowToast = (message: string, options?: { tone?: ToastTone; icon?: React.ReactNode }) => void;

const ToastContext = createContext<ShowToast | null>(null);

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "border-owl bg-correct-bg text-owl-text",
  error: "border-cardinal bg-wrong-bg text-cardinal",
  info: "border-sky bg-sel-bg text-sel-text",
  achievement: "border-bee bg-panel text-strong",
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ShowToast>((message, options = {}) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, message, tone: options.tone ?? "info", icon: options.icon }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-pop-in flex max-w-sm items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-sm font-bold shadow-lg ${TONE_CLASSES[toast.tone]}`}
          >
            {toast.icon}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
