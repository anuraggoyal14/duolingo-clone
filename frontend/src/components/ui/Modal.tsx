"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}

/** Accessible centered dialog: Escape closes, focus moves inside, backdrop click closes. */
export function Modal({ open, onClose, children, labelledBy }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback without re-running the focus effect on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="animate-pop-in w-full max-w-md rounded-3xl bg-panel p-6 text-center shadow-xl sm:p-8"
      >
        {children}
      </div>
    </div>
  );
}
