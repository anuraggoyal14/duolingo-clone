// Picture-card illustrations for Spanish vocabulary, drawn as flat SVG in a 100x100 box.
// People words reuse the cast drawings from ./characters, scaled into the box.

import type { JSX, ReactNode } from "react";
import { DiegoFigure, LuciaFigure, MateoFigure, SofiaFigure } from "./characters";

export type VocabArtProps = { className?: string };
export type VocabArtComponent = (p: VocabArtProps) => JSX.Element;

const INK = "#4b4b4b";
const BLUE = "#1cb0f6";
const BLUE_DARK = "#1899d6";
const BLUE_LIGHT = "#84d8ff";
const BLUE_PALE = "#c4ebfd";
const GREEN = "#58cc02";
const GREEN_DARK = "#58a700";
const YELLOW = "#ffc800";
const ORANGE = "#ff9600";
const ORANGE_DARK = "#e07b00";
const RED = "#ff4b4b";
const RED_DARK = "#ea2b2b";
const BROWN = "#a86b3c";
const BROWN_DARK = "#7a4a26";
const GREY = "#afafaf";

function Art({ label, className = "h-24 w-24", children }: VocabArtProps & { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function Shadow({ cx = 50, cy = 90, rx = 30 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={4} fill="#000" opacity={0.08} />;
}

/** Places a 120x140 character drawing at (x, y) with scale s. */
function Place({ x, y, s, children }: { x: number; y: number; s: number; children: ReactNode }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>;
}

function Eye({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#2d2d2d" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.35} r={r * 0.32} fill="#fff" />
    </>
  );
}

function starPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const d = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/* ---------------------------------- people --------------------------------- */

function Man({ className }: VocabArtProps) {
  return (
    <Art label="man" className={className}>
      <Place x={11.6} y={2.4} s={0.64}>
        <MateoFigure />
      </Place>
    </Art>
  );
}

function Woman({ className }: VocabArtProps) {
  return (
    <Art label="woman" className={className}>
      <Place x={11.6} y={2.4} s={0.64}>
        <SofiaFigure />
      </Place>
    </Art>
  );
}

function Boy({ className }: VocabArtProps) {
  return (
    <Art label="boy" className={className}>
      <Place x={8.4} y={2.4} s={0.64}>
        <DiegoFigure />
      </Place>
    </Art>
  );
}

function Girl({ className }: VocabArtProps) {
  return (
    <Art label="girl" className={className}>
      <Place x={11.6} y={2.4} s={0.64}>
        <LuciaFigure />
      </Place>
    </Art>
  );
}

function Father({ className }: VocabArtProps) {
  return (
    <Art label="father" className={className}>
      <Place x={1} y={10.8} s={0.58}>
        <MateoFigure mood="happy" />
      </Place>
      <Place x={49.5} y={33.2} s={0.42}>
        <DiegoFigure mood="happy" />
      </Place>
    </Art>
  );
}

function Mother({ className }: VocabArtProps) {
  return (
    <Art label="mother" className={className}>
      <Place x={-0.3} y={10.8} s={0.58}>
        <SofiaFigure mood="happy" />
      </Place>
      <Place x={48.6} y={33.2} s={0.42}>
        <LuciaFigure mood="happy" />
      </Place>
    </Art>
  );
}

function Brother({ className }: VocabArtProps) {
  return (
    <Art label="brother" className={className}>
      <Place x={-4.5} y={17.2} s={0.52}>
        <DiegoFigure />
      </Place>
      <Place x={51.7} y={31.2} s={0.42}>
        <DiegoFigure cap={false} tint={GREEN} />
      </Place>
    </Art>
  );
}

function Sister({ className }: VocabArtProps) {
  return (
    <Art label="sister" className={className}>
      <Place x={0} y={20} s={0.5}>
        <LuciaFigure />
      </Place>
      <Place x={50.8} y={34} s={0.4}>
        <LuciaFigure tint="#ff86d0" />
      </Place>
    </Art>
  );
}

function Family({ className }: VocabArtProps) {
  return (
    <Art label="family" className={className}>
      <Place x={-3.5} y={17.6} s={0.46}>
        <MateoFigure mood="happy" />
      </Place>
      <Place x={50.2} y={17.6} s={0.46}>
        <SofiaFigure mood="happy" />
      </Place>
      <Place x={30.8} y={37.2} s={0.32}>
        <LuciaFigure mood="happy" />
      </Place>
    </Art>
  );
}

/* ------------------------------- food & drink ------------------------------ */

function Water({ className }: VocabArtProps) {
  return (
    <Art label="water" className={className}>
      <Shadow cy={91} rx={22} />
      <path d="M26 14H74L67 85Q66.6 90 62 90H38Q33.4 90 33 85Z" fill={BLUE_PALE} />
      <path d="M29.6 38H70.4L65.4 80Q65 84 61 84H39Q35 84 34.6 80Z" fill="#49c0f8" />
      <ellipse cx={50} cy={38} rx={20.4} ry={3.2} fill="#a8e2ff" />
      <ellipse cx={50} cy={14} rx={24} ry={3.6} fill="#a8e2ff" />
      <ellipse cx={50} cy={14} rx={21} ry={2.2} fill="#e8f8ff" />
      <path d="M34 22l4 52" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <g fill="#a8e2ff">
        <circle cx={56} cy={60} r={2} />
        <circle cx={62} cy={70} r={1.5} />
        <circle cx={52} cy={74} r={1.5} />
      </g>
    </Art>
  );
}

function Bread({ className }: VocabArtProps) {
  return (
    <Art label="bread" className={className}>
      <Shadow cy={80} rx={34} />
      <path d="M14 58C14 38 30 28 50 28S86 38 86 58c0 10-6 16-16 16H30c-10 0-16-6-16-16z" fill="#f0a845" />
      <path d="M15 62c2 8 8 12 15 12h40c7 0 13-4 15-12-10 5-60 5-70 0z" fill="#cf842c" />
      <path d="M30 50l10-12M45 48l10-12M60 50l10-12" stroke="#ffd88f" strokeWidth={4.5} strokeLinecap="round" />
    </Art>
  );
}

function Milk({ className }: VocabArtProps) {
  return (
    <Art label="milk" className={className}>
      <Shadow cy={89} rx={28} />
      <path d="M58 42 74 34v46l-16 8z" fill={BLUE_DARK} />
      <path d="M26 42h32v46H26z" fill={BLUE} />
      <path d="M42 24 58 16l16 18-16 8z" fill={BLUE_LIGHT} />
      <path d="M26 42 42 24l16 18z" fill={BLUE_PALE} />
      <path d="M42 24 58 16v-5l-16 8z" fill="#a8e2ff" />
      <path d="M42 56c4 5 7 9 7 12.5a7 7 0 0 1-14 0c0-3.5 3-7.5 7-12.5z" fill="#fff" />
    </Art>
  );
}

function Coffee({ className }: VocabArtProps) {
  return (
    <Art label="coffee" className={className}>
      <ellipse cx={50} cy={87} rx={34} ry={6.5} fill="#d7d7d7" />
      <ellipse cx={50} cy={85.5} rx={28} ry={4} fill="#efefef" />
      <path d="M64 52c11-2 16 5 14 12-2 6-8 8-14 8" stroke={RED_DARK} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      <path d="M20 42h46v26c0 12-10 18-23 18S20 80 20 68z" fill={RED} />
      <ellipse cx={43} cy={42} rx={23} ry={5.5} fill="#ff8080" />
      <ellipse cx={43} cy={42.8} rx={19} ry={3.6} fill={BROWN_DARK} />
      <path d="M27 51v14" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.45} />
      <path
        d="M34 32q-5-5 0-10t0-10M44 30q-5-5 0-10t0-10M54 32q-5-5 0-10t0-10"
        stroke="#c7c7c7"
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
    </Art>
  );
}

function Apple({ className }: VocabArtProps) {
  return (
    <Art label="apple" className={className}>
      <Shadow cy={91} rx={24} />
      <path d="M50 32c0-8 2-13 5-17" stroke={BROWN_DARK} strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M54 22c4-9 14-11 20-8-3 8-12 12-20 8z" fill={GREEN} />
      <path d="M56 21c5-2 10-4 15-6" stroke={GREEN_DARK} strokeWidth={1.5} strokeLinecap="round" />
      <path
        d="M50 30c-10-7-31-6-32 17-1 20 12 41 26 41 3 0 4-2 6-2s3 2 6 2c14 0 27-21 26-41-1-23-22-24-32-17z"
        fill={RED}
      />
      <ellipse cx={31} cy={45} rx={4} ry={7.5} transform="rotate(20 31 45)" fill="#fff" opacity={0.55} />
    </Art>
  );
}

function Cheese({ className }: VocabArtProps) {
  return (
    <Art label="cheese" className={className}>
      <Shadow cy={82} rx={38} />
      <path d="M14 48 66 20l20 28z" fill="#ffe066" />
      <path d="M14 48h72v26a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill={YELLOW} />
      <g fill="#f0a800">
        <circle cx={30} cy={61} r={5.5} />
        <circle cx={55} cy={66} r={4} />
        <circle cx={73} cy={58} r={3.5} />
      </g>
      <g fill="#f5c400">
        <ellipse cx={46} cy={41} rx={5} ry={2.4} />
        <ellipse cx={62} cy={32} rx={3.5} ry={1.8} />
      </g>
    </Art>
  );
}

const RICE_GRAINS: [number, number, number][] = [
  [32, 42, -20], [40, 35, 15], [50, 31, -10], [60, 35, 20], [68, 42, -15],
  [45, 43, 30], [56, 44, -25], [38, 48, 0], [62, 48, 10],
];

function Rice({ className }: VocabArtProps) {
  return (
    <Art label="rice" className={className}>
      <Shadow cy={89} rx={28} />
      <path d="M57 42 83 12M64 44l26-28" stroke={BROWN} strokeWidth={4} strokeLinecap="round" />
      <path d="M18 50c0-16 15-24 32-24s32 8 32 24z" fill="#fff" stroke="#e1e1e1" strokeWidth={2} />
      <g fill="#e3e3e3">
        {RICE_GRAINS.map(([cx, cy, rot]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={2.8} ry={1.5} transform={`rotate(${rot} ${cx} ${cy})`} />
        ))}
      </g>
      <rect x={38} y={83} width={24} height={6} rx={2} fill={BLUE_DARK} />
      <path d="M12 50h76c0 20-17 36-38 36S12 70 12 50z" fill={BLUE} />
      <rect x={11} y={48} width={78} height={5} rx={2.5} fill={BLUE_LIGHT} />
      <path d="M22 64h56" stroke={BLUE_LIGHT} strokeWidth={3} strokeLinecap="round" />
    </Art>
  );
}

function Orange({ className }: VocabArtProps) {
  return (
    <Art label="orange" className={className}>
      <Shadow cy={91} rx={26} />
      <path d="M50 24v-7" stroke={BROWN_DARK} strokeWidth={4} strokeLinecap="round" />
      <path d="M52 20c6-8 16-8 22-4-5 7-14 9-22 4z" fill={GREEN} />
      <circle cx={50} cy={55} r={33} fill={ORANGE} />
      <g fill="#ffb347">
        <circle cx={40} cy={62} r={1.4} />
        <circle cx={58} cy={44} r={1.4} />
        <circle cx={63} cy={70} r={1.4} />
        <circle cx={47} cy={75} r={1.4} />
        <circle cx={71} cy={56} r={1.4} />
        <circle cx={29} cy={57} r={1.4} />
        <circle cx={53} cy={59} r={1.4} />
      </g>
      <circle cx={50} cy={24.5} r={2} fill={ORANGE_DARK} />
      <ellipse cx={36} cy={42} rx={5} ry={8} transform="rotate(35 36 42)" fill="#fff" opacity={0.5} />
    </Art>
  );
}

function Meal({ className }: VocabArtProps) {
  return (
    <Art label="food" className={className}>
      {/* fork and knife */}
      <path d="M10 28v12a4 4 0 0 0 8 0V28M14 28v14" stroke={GREY} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M14 44v40M89 50v34" stroke={GREY} strokeWidth={4.5} strokeLinecap="round" />
      <path d="M86 28c4 2 6 10 6 22h-6z" fill="#c7c7c7" />
      {/* plate */}
      <circle cx={50} cy={56} r={30} fill={BLUE_LIGHT} />
      <circle cx={50} cy={56} r={22} fill={BLUE_PALE} />
      {/* chicken leg and peas */}
      <path d="M52 53 61 44" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <circle cx={60} cy={41.5} r={3.3} fill="#fff" />
      <circle cx={63.5} cy={45} r={3.3} fill="#fff" />
      <ellipse cx={44} cy={60} rx={13} ry={10} transform="rotate(-40 44 60)" fill="#e0892b" />
      <ellipse cx={40} cy={58} rx={4} ry={2.5} transform="rotate(-40 40 58)" fill="#f5b064" />
      <g fill={GREEN}>
        <circle cx={57} cy={66} r={4} />
        <circle cx={63} cy={62} r={4} />
        <circle cx={64} cy={70} r={4} />
      </g>
    </Art>
  );
}

/* ---------------------------------- animals -------------------------------- */

function Dog({ className }: VocabArtProps) {
  return (
    <Art label="dog" className={className}>
      <path d="M50 22c18 0 30 13 30 32 0 20-13 32-30 32S20 74 20 54c0-19 12-32 30-32z" fill="#e3a868" />
      <ellipse cx={62} cy={46} rx={9} ry={8} fill="#c8864a" />
      <path
        d="M30 26c-14-2-22 14-20 30 1 8 8 10 12 4 4-6 6-16 12-26zM70 26c14-2 22 14 20 30-1 8-8 10-12 4-4-6-6-16-12-26z"
        fill={BROWN}
      />
      <ellipse cx={50} cy={68} rx={16} ry={12} fill="#fbe3c4" />
      <Eye cx={39} cy={48} r={4.2} />
      <Eye cx={61} cy={48} r={4.2} />
      <path d="M47 71.5h6v3a3 3 0 0 1-6 0z" fill="#ff7a8a" />
      <path d="M50 64.5v4.5M43 70q3.5 3 7-1q3.5 4 7 1" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <ellipse cx={50} cy={60} rx={6.5} ry={4.5} fill={INK} />
      <ellipse cx={48} cy={58.5} rx={2} ry={1} fill="#fff" opacity={0.6} />
    </Art>
  );
}

function Cat({ className }: VocabArtProps) {
  const fur = "#b5b5b5";
  return (
    <Art label="cat" className={className}>
      <path d="M21 50 24 14l24 20zM79 50 76 14 52 34z" fill={fur} />
      <path d="M28 38l1.5-15 12 10zM72 38l-1.5-15-12 10z" fill="#ffb3c7" />
      <ellipse cx={50} cy={58} rx={32} ry={27} fill={fur} />
      <path d="M44 36v6M50 34v8M56 36v6" stroke="#8a8a8a" strokeWidth={3.5} strokeLinecap="round" />
      <g fill="#89e219">
        <ellipse cx={38} cy={53} rx={5.5} ry={6.5} />
        <ellipse cx={62} cy={53} rx={5.5} ry={6.5} />
      </g>
      <g fill="#2d2d2d">
        <ellipse cx={38} cy={53} rx={1.8} ry={5} />
        <ellipse cx={62} cy={53} rx={1.8} ry={5} />
      </g>
      <circle cx={40} cy={50} r={1.3} fill="#fff" />
      <circle cx={64} cy={50} r={1.3} fill="#fff" />
      <circle cx={44.5} cy={68} r={6.5} fill="#fff" />
      <circle cx={55.5} cy={68} r={6.5} fill="#fff" />
      <path d="M46 63h8l-4 4.5z" fill="#ff8aa8" stroke="#ff8aa8" strokeWidth={2} strokeLinejoin="round" />
      <path d="M50 67.5v3M45.5 72.5q2.25 1.5 4.5-2q2.25 3.5 4.5 2" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M37 66 13 61M37 71 13 73M63 66l24-5M63 71l24 2" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </Art>
  );
}

function Bird({ className }: VocabArtProps) {
  return (
    <Art label="bird" className={className}>
      <Shadow cy={90} rx={20} />
      <path d="M42 78v10M54 78v10M38 88h8M50 88h8" stroke={ORANGE} strokeWidth={3} strokeLinecap="round" />
      <path d="M24 54 6 44c0 10 4 20 12 24z" fill={BLUE_DARK} />
      <path d="M46 33c-2-8 4-12 8-8-4 0-5 4-4 8zM52 32c1-7 8-9 10-4-4-1-6 1-7 5z" fill={BLUE} />
      <ellipse cx={48} cy={56} rx={28} ry={24} fill={BLUE} />
      <ellipse cx={54} cy={64} rx={17} ry={13} fill="#ddf4ff" />
      <path d="M28 54c4-12 22-12 28 0-6 12-22 14-28 0z" fill={BLUE_DARK} />
      <path d="M73 48 88 54 73 60z" fill={ORANGE} stroke={ORANGE} strokeWidth={2} strokeLinejoin="round" />
      <Eye cx={63} cy={47} r={4} />
      <circle cx={67} cy={56} r={3} fill="#ff7a7a" opacity={0.5} />
    </Art>
  );
}

function Fish({ className }: VocabArtProps) {
  return (
    <Art label="fish" className={className}>
      <g fill="none" stroke={BLUE_LIGHT} strokeWidth={2}>
        <circle cx={9} cy={34} r={2.5} />
        <circle cx={14} cy={24} r={3.5} />
      </g>
      <path d="M70 50 88 34c-3 10-3 22 0 32z" fill={ORANGE_DARK} />
      <path d="M32 36c6-13 24-16 30 2z" fill={ORANGE_DARK} />
      <path d="M42 64c2 8 10 12 16 8-2-4-4-7-4-10z" fill={ORANGE_DARK} />
      <path d="M14 50c8-16 26-22 42-18 8 2 14 8 18 18-4 10-10 16-18 18-16 4-34-2-42-18z" fill={ORANGE} />
      <path d="M34 39c-5 7-5 15 0 22" stroke={ORANGE_DARK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path
        d="M46 42q4 4 0 8M54 40q4 5 0 10M46 52q4 4 0 8M54 51q4 5 0 10M62 45q4 5 0 10"
        stroke="#ffb347"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={24} cy={46} r={4.5} fill="#fff" />
      <circle cx={23} cy={46} r={2.6} fill="#2d2d2d" />
      <path d="M16 53q2.5 1.5 5 0" stroke="#b35a00" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Art>
  );
}

function Horse({ className }: VocabArtProps) {
  const mane = "#5c3a21";
  return (
    <Art label="horse" className={className}>
      <path d="M64 24l6-17 6 18z" fill="#9a5226" />
      <path d="M54 22 57 4l9 16z" fill="#c0703a" />
      <path
        d="M56 18C46 20 38 28 32 40c-6 12-14 20-16 28-2 8 4 14 12 14 6 0 10-4 16-8 4-2 8-4 12-2 2 8 2 14 0 20h30c2-18-2-40-10-56-4-8-10-16-20-18z"
        fill="#c0703a"
      />
      <path d="M42 28c-6 10-14 24-20 34 4 1 8-2 11-7 6-10 10-19 9-27z" fill="#fff" />
      <path d="M58 16c12-2 22 6 26 16 6 14 8 36 8 60h-8c0-22-2-40-8-54-3-8-10-14-18-18z" fill={mane} />
      <path d="M54 16c-6 2-9 8-8 15 3-4 7-7 12-8z" fill={mane} />
      <Eye cx={48} cy={42} r={3.5} />
      <ellipse cx={22} cy={72} rx={2.5} ry={3.5} transform="rotate(-20 22 72)" fill={mane} />
      <path d="M20 79q4 1.5 8 0" stroke={mane} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Art>
  );
}

/* ------------------------------- home & travel ----------------------------- */

function House({ className }: VocabArtProps) {
  return (
    <Art label="house" className={className}>
      <Shadow cy={89} rx={36} />
      <rect x={64} y={20} width={9} height={20} rx={1.5} fill={RED_DARK} />
      <rect x={22} y={46} width={56} height={42} rx={2} fill={YELLOW} />
      <path d="M14 50 50 18l36 32z" fill={RED} stroke={RED} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={50} cy={37} r={4.5} fill={BLUE_LIGHT} />
      <path d="M42 88V68a8 8 0 0 1 16 0v20z" fill={BROWN} />
      <circle cx={54} cy={78} r={1.5} fill={YELLOW} />
      <rect x={27} y={58} width={11} height={11} rx={2} fill={BLUE_LIGHT} />
      <rect x={62} y={58} width={11} height={11} rx={2} fill={BLUE_LIGHT} />
      <path d="M32.5 58v11M27 63.5h11M67.5 58v11M62 63.5h11" stroke="#fff" strokeWidth={1.8} />
    </Art>
  );
}

function Table({ className }: VocabArtProps) {
  return (
    <Art label="table" className={className}>
      <Shadow cy={78} rx={38} />
      <rect x={27} y={40} width={5} height={28} rx={2} fill={BROWN_DARK} />
      <rect x={68} y={40} width={5} height={28} rx={2} fill={BROWN_DARK} />
      <path d="M12 36 26 26h48l14 10z" fill="#e0a96d" />
      <path d="M30 31h40" stroke="#c98c4f" strokeWidth={1.5} strokeLinecap="round" />
      <rect x={10} y={35} width={80} height={8} rx={3} fill={BROWN} />
      <rect x={15} y={41} width={7} height={35} rx={2.5} fill={BROWN} />
      <rect x={78} y={41} width={7} height={35} rx={2.5} fill={BROWN} />
    </Art>
  );
}

function Bed({ className }: VocabArtProps) {
  return (
    <Art label="bed" className={className}>
      <Shadow cy={80} rx={40} />
      <rect x={10} y={22} width={11} height={56} rx={4} fill={BROWN} />
      <rect x={14} y={58} width={72} height={10} rx={2} fill={BROWN_DARK} />
      <rect x={18} y={46} width={66} height={14} rx={4} fill="#fff" stroke="#dcdcdc" strokeWidth={2} />
      <rect x={20} y={36} width={22} height={12} rx={6} fill="#fff" stroke="#dcdcdc" strokeWidth={2} />
      <path d="M40 44h44v18H40c-3 0-5-4-5-9s2-9 5-9z" fill={BLUE} />
      <path d="M35 53c0-5 2-9 5-9h6v18h-6c-3 0-5-4-5-9z" fill={BLUE_LIGHT} />
      <rect x={81} y={44} width={9} height={34} rx={4} fill={BROWN} />
    </Art>
  );
}

function Train({ className }: VocabArtProps) {
  const metal = "#4b4b4b";
  return (
    <Art label="train" className={className}>
      <path d="M6 88h88" stroke={GREY} strokeWidth={3} strokeLinecap="round" />
      <g fill="#e5e5e5">
        <circle cx={30} cy={15} r={5} />
        <circle cx={21} cy={9} r={4} />
      </g>
      <path d="M24 26h12l-2 18h-8z" fill={metal} />
      <rect x={22} y={23} width={16} height={5} rx={2} fill={metal} />
      <rect x={56} y={27} width={28} height={44} rx={3} fill={RED} />
      <rect x={52} y={22} width={36} height={7} rx={3} fill={RED_DARK} />
      <rect x={62} y={34} width={16} height={14} rx={3} fill={BLUE_LIGHT} />
      <path d="M16 66 6 82h14z" fill={YELLOW} />
      <rect x={16} y={42} width={44} height={28} rx={10} fill={BLUE} />
      <path d="M30 42v28M44 42v28" stroke={BLUE_DARK} strokeWidth={3} />
      <circle cx={17} cy={50} r={4} fill={YELLOW} />
      <rect x={12} y={68} width={76} height={6} rx={3} fill={metal} />
      <g fill={metal}>
        <circle cx={28} cy={78} r={8} />
        <circle cx={48} cy={78} r={8} />
        <circle cx={72} cy={76} r={10} />
      </g>
      <g fill={GREY}>
        <circle cx={28} cy={78} r={3} />
        <circle cx={48} cy={78} r={3} />
        <circle cx={72} cy={76} r={3.5} />
      </g>
    </Art>
  );
}

function Airplane({ className }: VocabArtProps) {
  return (
    <Art label="airplane" className={className}>
      <path d="M46 48h12L44 30h-6z" fill={BLUE_DARK} />
      <path d="M14 50 8 24h10l16 26z" fill={BLUE_DARK} />
      <path d="M14 46h58c12 0 22 4 22 10s-10 10-22 10H24c-6 0-10-4-12-10z" fill={BLUE} />
      <path d="M20 61h62" stroke={BLUE_LIGHT} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M80 49c6 0 10 2 12 5H80z" fill="#ddf4ff" />
      <g fill="#fff">
        <circle cx={30} cy={53} r={2.8} />
        <circle cx={40} cy={53} r={2.8} />
        <circle cx={50} cy={53} r={2.8} />
        <circle cx={60} cy={53} r={2.8} />
        <circle cx={70} cy={53} r={2.8} />
      </g>
      <path d="M44 58h16L44 84h-8z" fill={BLUE_DARK} />
    </Art>
  );
}

const HOTEL_WINDOWS = [32, 45, 58].flatMap((y, row) =>
  [24.5, 38.5, 52.5, 66.5].map((x, col) => ({ x, y, lit: (row + col) % 3 === 0 })),
);

function Hotel({ className }: VocabArtProps) {
  return (
    <Art label="hotel" className={className}>
      <Shadow cy={89} rx={36} />
      <path d="M40 18v4M60 18v4" stroke="#a560e8" strokeWidth={3} />
      <rect x={34} y={8} width={32} height={10} rx={3} fill={YELLOW} />
      <g fill="#fff">
        <polygon points={starPoints(42, 13, 3.4)} />
        <polygon points={starPoints(50, 13, 3.4)} />
        <polygon points={starPoints(58, 13, 3.4)} />
      </g>
      <rect x={20} y={20} width={60} height={68} rx={3} fill="#ce82ff" />
      <rect x={17} y={20} width={66} height={6} rx={3} fill="#a560e8" />
      {HOTEL_WINDOWS.map((w) => (
        <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width={9} height={8} rx={1.5} fill={w.lit ? "#ffe066" : "#ddf4ff"} />
      ))}
      <rect x={42} y={72} width={16} height={16} rx={1.5} fill={BLUE_LIGHT} />
      <path d="M50 72v16" stroke="#a560e8" strokeWidth={1.8} />
      <path d="M38 68h24l3 6H35z" fill={RED} />
      <path d="M44 68l-1 6M50 68v6M56 68l1 6" stroke="#fff" strokeWidth={2} />
    </Art>
  );
}

function Book({ className }: VocabArtProps) {
  return (
    <Art label="book" className={className}>
      <Shadow cy={90} rx={30} />
      <rect x={28} y={18} width={52} height={70} rx={4} fill={GREEN_DARK} />
      <rect x={26} y={16} width={50} height={68} rx={3} fill="#fff" />
      <path d="M74 20v60M30 82h42" stroke="#e5e5e5" strokeWidth={1.2} />
      <path d="M58 78v14l4-3.5 4 3.5V78z" fill={RED} />
      <rect x={20} y={12} width={52} height={68} rx={4} fill={GREEN} />
      <rect x={20} y={12} width={9} height={68} rx={4} fill={GREEN_DARK} />
      <rect x={36} y={26} width={28} height={12} rx={3} fill="#d7ffb8" />
    </Art>
  );
}

/** Picture-card art keyed by the exact lowercase Spanish text. */
export const VOCAB_ART: Record<string, VocabArtComponent> = {
  // people
  "el hombre": Man,
  "la mujer": Woman,
  "el niño": Boy,
  "la niña": Girl,
  "el padre": Father,
  "la madre": Mother,
  "el hermano": Brother,
  "la hermana": Sister,
  "la familia": Family,
  // food & drink
  "el agua": Water,
  "el pan": Bread,
  "la leche": Milk,
  "el café": Coffee,
  "la manzana": Apple,
  "el queso": Cheese,
  "el arroz": Rice,
  "la naranja": Orange,
  "la comida": Meal,
  // animals
  "el perro": Dog,
  "el gato": Cat,
  "el pájaro": Bird,
  "el pez": Fish,
  "el caballo": Horse,
  // home & travel
  "la casa": House,
  "la mesa": Table,
  "la cama": Bed,
  "el tren": Train,
  "el avión": Airplane,
  "el hotel": Hotel,
  "el libro": Book,
};

/** Looks up the art for a word ("  El Perro " -> dog), or null when there is none. */
export function artFor(text: string): VocabArtComponent | null {
  const key = text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  return Object.prototype.hasOwnProperty.call(VOCAB_ART, key) ? VOCAB_ART[key] : null;
}
