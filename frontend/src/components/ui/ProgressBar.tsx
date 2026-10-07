const COLORS = {
  owl: "bg-owl",
  bee: "bg-bee",
  fox: "bg-fox",
  sky: "bg-sky",
};

interface ProgressBarProps {
  value: number; // 0..1
  color?: keyof typeof COLORS;
  label?: string;
  className?: string;
}

/** Rounded Duolingo progress bar with the glossy highlight stripe. */
export function ProgressBar({ value, color = "owl", label, className = "h-4" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-line ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`relative h-full rounded-full transition-[width] duration-500 ease-out ${COLORS[color]}`}
        style={{ width: `${pct}%` }}
      >
        {pct > 4 && <div className="absolute inset-x-2 top-[22%] h-[28%] rounded-full bg-white/30" />}
      </div>
      {label && (
        // The label sits in the middle: dark when it overlaps the fill, muted over the empty track.
        <span
          className={`absolute inset-0 flex items-center justify-center text-[11px] font-extrabold ${
            pct >= 50 ? "text-[#4b4b4b]" : "text-muted"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
