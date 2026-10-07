// "Lingo", an original owl-style mascot drawn in SVG. Moods change the eyes/wings.

export type MascotMood = "happy" | "cheer" | "sad" | "think";

export function Mascot({ mood = "happy", className = "h-32 w-32" }: { mood?: MascotMood; className?: string }) {
  const wingsUp = mood === "cheer";
  return (
    <svg viewBox="0 0 120 130" className={className} role="img" aria-label="Lingo the owl">
      {/* feet */}
      <path d="M44 118c0-5 3-7 6-7s6 2 6 7zM64 118c0-5 3-7 6-7s6 2 6 7z" fill="#ff9600" />
      {/* wings */}
      <path
        d={wingsUp ? "M18 66C4 54 2 36 8 28c8 10 16 22 20 36z" : "M18 62c-10 10-12 26-6 36 6-6 12-18 14-30z"}
        fill="#58a700"
      />
      <path
        d={wingsUp ? "M102 66c14-12 16-30 10-38-8 10-16 22-20 36z" : "M102 62c10 10 12 26 6 36-6-6-12-18-14-30z"}
        fill="#58a700"
      />
      {/* body */}
      <path d="M60 14c26 0 44 18 44 50 0 30-18 52-44 52S16 94 16 64c0-32 18-50 44-50z" fill="#58cc02" />
      {/* ear tufts */}
      <path d="M26 30 22 8l20 14zM94 30l4-22-20 14z" fill="#58cc02" />
      {/* belly */}
      <path d="M60 64c16 0 28 12 28 28 0 14-12 22-28 22S32 106 32 92c0-16 12-28 28-28z" fill="#d7ffb8" />
      <path d="M48 84c4 3 8 3 12 0 4 3 8 3 12 0M50 94c3 2 7 2 10 0 3 2 7 2 10 0" stroke="#89e219" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="42" cy="46" r="16" fill="#fff" />
      <circle cx="78" cy="46" r="16" fill="#fff" />
      {mood === "sad" ? (
        <>
          <circle cx="43" cy="51" r="7" fill="#4b4b4b" />
          <circle cx="77" cy="51" r="7" fill="#4b4b4b" />
          {/* inner ends raised = worried brows */}
          <path d="M28 36 50 29M92 36 70 29" stroke="#3c7d00" strokeWidth="4" strokeLinecap="round" />
          <path d="M88 58c2 4 2 7 0 9-2-2-2-5 0-9z" fill="#84d8ff" />
        </>
      ) : mood === "cheer" ? (
        <>
          <path d="M34 48c4-6 12-6 16 0" stroke="#4b4b4b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M70 48c4-6 12-6 16 0" stroke="#4b4b4b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={mood === "think" ? 46 : 44} cy={mood === "think" ? 42 : 47} r="7.5" fill="#4b4b4b" />
          <circle cx={mood === "think" ? 82 : 80} cy={mood === "think" ? 42 : 47} r="7.5" fill="#4b4b4b" />
          <circle cx={mood === "think" ? 48 : 46} cy={mood === "think" ? 40 : 45} r="2.5" fill="#fff" />
          <circle cx={mood === "think" ? 84 : 82} cy={mood === "think" ? 40 : 45} r="2.5" fill="#fff" />
        </>
      )}
      {/* beak */}
      <path d="M53 58h14l-7 10z" fill="#ff9600" />
      <path d="M53 58h14l-3 4h-8z" fill="#ffc800" />
    </svg>
  );
}
