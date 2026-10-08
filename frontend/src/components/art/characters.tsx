// The speaking cast: four original characters drawn as flat SVG busts in the same
// rounded, friendly style as the Lingo mascot. Each one has three moods.
// The bare <g> drawings (…Figure) are exported too so other art can reuse them.

import type { JSX, ReactNode } from "react";

export type CharacterMood = "idle" | "happy" | "sad";
export type CharacterProps = { className?: string; mood?: CharacterMood };
export type CharacterComponent = (props: CharacterProps) => JSX.Element;
/** Props for the bare drawings (in the 120x140 character space). `tint` recolours the clothes. */
export type FigureProps = { mood?: CharacterMood; tint?: string };

const INK = "#2d2d2d";
const LINE = { stroke: INK, strokeWidth: 3, strokeLinecap: "round", fill: "none" } as const;

const TORSO_WOMAN = "M16 140c0-26 18-42 44-42s44 16 44 42z";
const TORSO_MAN = "M12 140c0-28 20-44 48-44s48 16 48 44z";
const TORSO_KID = "M22 140c0-26 17-44 38-44s38 18 38 44z";
const NECKLINE_KID = "M52 95.5c1 3 4 4.5 8 4.5s7-1.5 8-4.5z";

/** A darker copy of a shape, so tinted clothes keep their shading. */
function Dark({ d }: { d: string }) {
  return <path d={d} fill="#000" opacity={0.16} />;
}

function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={3.4} fill={INK} />
      <circle cx={cx + 1.1} cy={cy - 1.2} r={1.1} fill="#fff" />
    </>
  );
}

type FaceProps = { mood: CharacterMood; x?: number; y?: number; gap?: number; mouth?: number; cheeks?: boolean };

/** Eyes, nose, mouth and cheeks. (x, y) is the point between the eyes. */
function Face({ mood, x = 60, y = 60, gap = 10, mouth = 10, cheeks = true }: FaceProps) {
  const lx = x - gap;
  const rx = x + gap;
  const my = y + mouth;
  const ey = mood === "sad" ? y + 1 : y;
  return (
    <g>
      {cheeks && (
        <g fill="#ff7a7a" opacity={0.35}>
          <circle cx={lx - 5} cy={y + 7} r={4.5} />
          <circle cx={rx + 5} cy={y + 7} r={4.5} />
        </g>
      )}
      <ellipse cx={x} cy={y + 5} rx={2.4} ry={1.7} fill="#000" opacity={0.14} />
      {mood === "happy" ? (
        <>
          <path d={`M${lx - 4} ${y + 1}q4-6 8 0M${rx - 4} ${y + 1}q4-6 8 0`} {...LINE} />
          <path d={`M${x - 8} ${my - 1}h16q0 10-8 10t-8-10z`} fill={INK} />
          <ellipse cx={x} cy={my + 6} rx={4} ry={2.2} fill="#ff8a8a" />
        </>
      ) : (
        <>
          <Eye cx={lx} cy={ey} />
          <Eye cx={rx} cy={ey} />
          <path
            d={
              mood === "sad"
                ? `M${lx - 5} ${y - 6}l9-3.5M${rx + 5} ${y - 6}l-9-3.5M${x - 5} ${my + 4}q5-5 10 0`
                : `M${x - 5} ${my}q5 5 10 0`
            }
            {...LINE}
          />
        </>
      )}
    </g>
  );
}

/** Sofia: long dark wavy hair, purple top, gold earrings. */
export function SofiaFigure({ mood = "idle", tint }: FigureProps) {
  const skin = "#e8b08a";
  const shade = "#d0946c";
  const hair = "#3a2626";
  return (
    <g>
      <path
        d="M60 22C36 22 22 38 22 62c0 14-4 24-2 36 1 8 6 14 12 14h56c6 0 11-6 12-14 2-12-2-22-2-36 0-24-14-40-38-40z"
        fill={hair}
      />
      <rect x={52} y={74} width={16} height={30} rx={7} fill={shade} />
      <path d={TORSO_WOMAN} fill={tint ?? "#ce82ff"} />
      <path d="M50 97 60 112l10-15z" fill={shade} />
      {/* hair falling over the shoulders */}
      <path
        d="M21 88c-2 12 1 24 9 32 3-6 8-8 10-14 3-7 1-14-2-20zM99 88c2 12-1 24-9 32-3-6-8-8-10-14-3-7-1-14 2-20z"
        fill={hair}
      />
      <ellipse cx={60} cy={56} rx={25} ry={27} fill={skin} />
      <Face mood={mood} />
      <path d="M35 52C34 34 46 26 60 26c16 0 27 10 26 28-6-8-14-14-24-16-6 6-16 10-27 14z" fill={hair} />
      <path d="M28 46c-3 10-3 22 0 32M92 46c3 10 3 22 0 32" stroke="#5a3d3d" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <circle cx={38.5} cy={72} r={2.4} fill="#ffc800" />
      <circle cx={81.5} cy={72} r={2.4} fill="#ffc800" />
    </g>
  );
}

/** Mateo: short brown hair, beard and moustache, green hoodie. */
export function MateoFigure({ mood = "idle", tint }: FigureProps) {
  const skin = "#f6d1b0";
  const shade = "#e2b08a";
  const hair = "#7a4a26";
  const top = tint ?? "#58cc02";
  const hood = "M30 106c0-14 14-22 30-22s30 8 30 22z";
  const pocket = "M40 140c2-9 6-13 11-13h18c5 0 9 4 11 13z";
  return (
    <g>
      <path d={hood} fill={top} />
      <Dark d={hood} />
      <rect x={51} y={72} width={18} height={30} rx={8} fill={shade} />
      <path d={TORSO_MAN} fill={top} />
      <Dark d={pocket} />
      <path d="M51 95.5Q60 107 69 95.5z" fill={shade} />
      <path d="M55 100v13M65 100v13" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={55} cy={114} r={2.2} fill="#fff" />
      <circle cx={65} cy={114} r={2.2} fill="#fff" />
      <circle cx={35} cy={57} r={6} fill={skin} />
      <circle cx={85} cy={57} r={6} fill={skin} />
      <circle cx={35} cy={57} r={3} fill={shade} />
      <circle cx={85} cy={57} r={3} fill={shade} />
      <ellipse cx={60} cy={55} rx={25} ry={29} fill={skin} />
      {/* beard, moustache, hair */}
      <path
        d="M35 50c-2 14 0 30 12 37 5 3 21 3 26 0 12-7 14-23 12-37h-5c0 12-2 22-10 27-4 2-16 2-20 0-8-5-10-15-10-27z"
        fill={hair}
      />
      <path d="M51 67.5c3-3.5 7-3.5 9-1.5 2-2 6-2 9 1.5-3.5 1.5-6.5 1-9-.5-2.5 1.5-5.5 2-9 .5z" fill={hair} />
      <path
        d="M35 50C33 32 42 22 54 21c4-5 12-6 18-1 10 4 15 14 13 30-3-8-9-12-15-12-8 2-18 2-24 0-6 0-9 6-11 12z"
        fill={hair}
      />
      <Face mood={mood} y={57} mouth={12} cheeks={false} />
    </g>
  );
}

/** Lucia: two hair puffs with pink ties, yellow dress with a white collar. */
export function LuciaFigure({ mood = "idle", tint }: FigureProps) {
  const skin = "#a3683f";
  const shade = "#8a5532";
  const hair = "#241a17";
  return (
    <g>
      <circle cx={27} cy={38} r={15} fill={hair} />
      <circle cx={93} cy={38} r={15} fill={hair} />
      <path d="M19 32q4-5 9-4M86 30q5-3 9 0" stroke="#45342e" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <rect x={53} y={78} width={14} height={30} rx={6} fill={shade} />
      <path d={TORSO_KID} fill={tint ?? "#ffc800"} />
      <path d={NECKLINE_KID} fill={shade} />
      <path d="M48 96c0 8 8 11 12 4-4 0-7-1.5-8-4.5zM72 96c0 8-8 11-12 4 4 0 7-1.5 8-4.5z" fill="#fff" />
      <circle cx={60} cy={113} r={2.3} fill="#fff" />
      <circle cx={60} cy={123} r={2.3} fill="#fff" />
      <circle cx={33} cy={62} r={5.5} fill={skin} />
      <circle cx={87} cy={62} r={5.5} fill={skin} />
      <circle cx={60} cy={58} r={27} fill={skin} />
      <path d="M33 57C32 39 44 28 60 28s28 11 27 29c-5-9-13-14-27-14S38 48 33 57z" fill={hair} />
      <circle cx={40} cy={40} r={3.5} fill="#ff86d0" />
      <circle cx={80} cy={40} r={3.5} fill="#ff86d0" />
      <Face mood={mood} y={62} gap={11} />
    </g>
  );
}

/** Diego: red cap with a side brim (or curly hair with cap={false}), blue t-shirt. */
export function DiegoFigure({ mood = "idle", tint, cap = true }: FigureProps & { cap?: boolean }) {
  const skin = "#d39a6a";
  const shade = "#b97f52";
  const hair = "#2b1d14";
  return (
    <g>
      <rect x={53} y={78} width={14} height={30} rx={6} fill={shade} />
      <path d={TORSO_KID} fill={tint ?? "#1cb0f6"} />
      <path d={NECKLINE_KID} fill={shade} />
      <path d="M52 97c1 3 4 4.5 8 4.5s7-1.5 8-4.5" stroke="#000" strokeOpacity={0.16} strokeWidth={3.5} fill="none" />
      <path d="M60 106 53 118h6l-3 10 11-15h-6l5-7z" fill="#ffc800" />
      <circle cx={34} cy={62} r={5.5} fill={skin} />
      <circle cx={86} cy={62} r={5.5} fill={skin} />
      <ellipse cx={60} cy={58} rx={26} ry={27} fill={skin} />
      {cap ? (
        <>
          <path d="M35 49h10c-1 5-4 8-8 10-2-3-3-6-2-10zM85 49H75c1 5 4 8 8 10 2-3 3-6 2-10z" fill={hair} />
          <path d="M35 48C35 32 45 23 60 23s25 9 25 25z" fill="#ff4b4b" />
          <path d="M83 45c9-3 19-2 23 3-2 4-12 5-23 3z" fill="#ea2b2b" />
          <rect x={33} y={44} width={54} height={7} rx={3.5} fill="#ea2b2b" />
          <circle cx={60} cy={24} r={2.5} fill="#ea2b2b" />
        </>
      ) : (
        <g fill={hair}>
          <path d="M35 54C33 38 45 30 60 30s27 8 25 24c-5-7-13-11-25-11s-20 4-25 11z" />
          <circle cx={40} cy={42} r={7} />
          <circle cx={47} cy={34} r={8} />
          <circle cx={60} cy={30} r={9} />
          <circle cx={73} cy={34} r={8} />
          <circle cx={80} cy={42} r={7} />
        </g>
      )}
      <Face mood={mood} y={62} />
    </g>
  );
}

function Portrait({ name, className = "h-32 w-auto", children }: { name: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 140" className={className} role="img" aria-label={name}>
      {children}
    </svg>
  );
}

export function Sofia({ className, mood }: CharacterProps) {
  return (
    <Portrait name="Sofia" className={className}>
      <SofiaFigure mood={mood} />
    </Portrait>
  );
}

export function Mateo({ className, mood }: CharacterProps) {
  return (
    <Portrait name="Mateo" className={className}>
      <MateoFigure mood={mood} />
    </Portrait>
  );
}

export function Lucia({ className, mood }: CharacterProps) {
  return (
    <Portrait name="Lucia" className={className}>
      <LuciaFigure mood={mood} />
    </Portrait>
  );
}

export function Diego({ className, mood }: CharacterProps) {
  return (
    <Portrait name="Diego" className={className}>
      <DiegoFigure mood={mood} />
    </Portrait>
  );
}

export const CAST: readonly CharacterComponent[] = [Sofia, Mateo, Lucia, Diego];

/** Deterministically picks a cast member (seed % 4); safe for negative or fractional seeds. */
export function characterFor(seed: number): CharacterComponent {
  const n = CAST.length;
  const i = ((Math.trunc(seed) % n) + n) % n;
  return CAST[Number.isFinite(i) ? i : 0];
}
