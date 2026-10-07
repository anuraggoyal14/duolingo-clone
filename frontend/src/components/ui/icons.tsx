// Hand-drawn inline SVG icons (no icon library needed).

type IconProps = { className?: string; dim?: boolean };

export function FlameIcon({ className = "h-7 w-7", dim }: IconProps) {
  return (
    <svg viewBox="0 0 24 30" className={className} aria-hidden>
      <path
        d="M12 1c1 4.5 7.5 8 9.5 14.5C23.4 21.9 18.6 29 12 29S.6 23.6 2.4 16.6C3.4 12.7 6.4 10.6 7 6.8c2.2 1.6 3.3 3.6 3.4 5.9C12.6 9.7 12.8 5.4 12 1z"
        fill={dim ? "#e5e5e5" : "#ff9600"}
      />
      <path
        d="M12 15c.8 2.6 4.6 4.3 4.6 8.2 0 2.6-2.1 4.8-4.6 4.8s-4.6-2.1-4.6-4.6c0-2.3 1.7-3.4 2.4-5.2 1 .8 1.6 1.7 1.7 2.9.9-1.6 1-3.6.5-6.1z"
        fill={dim ? "#afafaf" : "#ffc800"}
      />
    </svg>
  );
}

export function GemIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 2h12l5 7-11 13L1 9z" fill="#1cb0f6" />
      <path d="M6 2h12l5 7H1z" fill="#84d8ff" />
      <path d="M8.5 9 12 22 15.5 9z" fill="#49c0f8" />
      <path d="M6 2l2.5 7h7L18 2z" fill="#ddf4ff" opacity=".7" />
    </svg>
  );
}

export function HeartIcon({ className = "h-7 w-7", dim }: IconProps) {
  return (
    <svg viewBox="0 0 24 22" className={className} aria-hidden>
      <path
        d="M12 21.5 2.6 12.3C-.2 9.5-.2 5 2.6 2.3a6.4 6.4 0 0 1 9 0l.4.4.4-.4a6.4 6.4 0 0 1 9 0c2.8 2.7 2.8 7.2 0 10z"
        fill={dim ? "#e5e5e5" : "#ff4b4b"}
      />
      <ellipse cx="7" cy="6.5" rx="2.4" ry="1.6" fill="#fff" opacity={dim ? 0.4 : 0.55} transform="rotate(-35 7 6.5)" />
    </svg>
  );
}

export function XpIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M13.5 1 4 14h7l-1.5 9L20 9.5h-7z" fill="#ffc800" stroke="#e5a400" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 12.5 10 18 20 6.5" />
    </svg>
  );
}

export function CloseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function StarIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1.8l3.1 6.6 7.1.9-5.2 4.9 1.3 7.1L12 17.8l-6.3 3.5L7 14.2 1.8 9.3l7.1-.9z" />
    </svg>
  );
}

export function LockIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A2.5 2.5 0 0 1 20 12.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10zm2.8 0h4.4V7.5a2.2 2.2 0 0 0-4.4 0z" />
    </svg>
  );
}

export function TrophyIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6 2h12v2h4v3a5 5 0 0 1-4.6 5 6 6 0 0 1-4.4 3.9V19h3.5a1.5 1.5 0 0 1 1.5 1.5V22H6v-1.5A1.5 1.5 0 0 1 7.5 19H11v-3.1A6 6 0 0 1 6.6 12 5 5 0 0 1 2 7V4h4zm12 4v3.8A3 3 0 0 0 20 7V6zM4 6v1a3 3 0 0 0 2 2.8V6z" />
    </svg>
  );
}

export function CrownIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M2 7l5 4 5-7 5 7 5-4-2 12H4z" fill="#ffc800" stroke="#e5a400" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="4" y="19" width="16" height="2.5" rx="1" fill="#e5a400" />
    </svg>
  );
}

export function SpeakerIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 9.5v5A1.5 1.5 0 0 0 4.5 16H7l4.4 3.7A1 1 0 0 0 13 19V5a1 1 0 0 0-1.6-.8L7 8H4.5A1.5 1.5 0 0 0 3 9.5z" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a1 1 0 0 0 0 2H20v2H6.5A2.5 2.5 0 0 1 4 19.5z" />
    </svg>
  );
}

export function DumbbellIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="1" y="9" width="3" height="6" rx="1" />
      <rect x="4" y="6" width="4" height="12" rx="1.5" />
      <rect x="8" y="10.5" width="8" height="3" />
      <rect x="16" y="6" width="4" height="12" rx="1.5" />
      <rect x="20" y="9" width="3" height="6" rx="1" />
    </svg>
  );
}

export function ChestIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 28" className={className} aria-hidden>
      <path d="M3 10a7 7 0 0 1 7-7h12a7 7 0 0 1 7 7v3H3z" fill="#cd7900" />
      <rect x="3" y="12" width="26" height="14" rx="2.5" fill="#ff9600" />
      <rect x="3" y="12" width="26" height="3" fill="#e58600" />
      <rect x="13" y="10" width="6" height="8" rx="1.5" fill="#ffc800" stroke="#e5a400" />
    </svg>
  );
}

// ---------------------------------------------------------------- navigation icons

export function HomeNavIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 14 16 4l12 10v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#ff9600" />
      <path d="M2.5 14.5 16 3l13.5 11.5" fill="none" stroke="#e5533c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12.5" y="19" width="7" height="10" rx="1.5" fill="#cd7900" />
    </svg>
  );
}

export function ShieldNavIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 2 28 6v9c0 7.5-5.4 12.8-12 15-6.6-2.2-12-7.5-12-15V6z" fill="#ffc800" />
      <path d="M16 6l8 2.8V15c0 5-3.4 8.7-8 10.4-4.6-1.7-8-5.4-8-10.4V8.8z" fill="#e5a400" />
      <path d="m16 10 1.8 3.6 4 .6-2.9 2.8.7 4L16 19.1 12.4 21l.7-4-2.9-2.8 4-.6z" fill="#fff" />
    </svg>
  );
}

export function QuestNavIcon({ className = "h-8 w-8" }: IconProps) {
  return <ChestIcon className={className} />;
}

export function ShopNavIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 12h24v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#ff4b4b" />
      <path d="M3 5h26l2 7a4 4 0 0 1-7.5 2 4 4 0 0 1-7.5 0 4 4 0 0 1-7.5 0A4 4 0 0 1 1 12z" fill="#ff9600" />
      <rect x="12" y="19" width="8" height="10" rx="1.5" fill="#ffc800" />
    </svg>
  );
}

export function ProfileNavIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#ce82ff" />
      <circle cx="16" cy="13" r="5" fill="#fff" />
      <path d="M7 25.5a10 10 0 0 1 18 0A13.9 13.9 0 0 1 16 30a13.9 13.9 0 0 1-9-4.5z" fill="#fff" />
    </svg>
  );
}

export function MoreNavIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#1cb0f6" />
      <circle cx="9.5" cy="16" r="2.5" fill="#fff" />
      <circle cx="16" cy="16" r="2.5" fill="#fff" />
      <circle cx="22.5" cy="16" r="2.5" fill="#fff" />
    </svg>
  );
}

export function SpainFlag({ className = "h-7 w-9" }: IconProps) {
  return (
    <svg viewBox="0 0 36 26" className={className} aria-hidden>
      <rect width="36" height="26" rx="5" fill="#c60b1e" />
      <rect y="6.5" width="36" height="13" fill="#ffc400" />
      <rect x="9" y="10" width="5" height="6" rx="1" fill="#c60b1e" opacity=".8" />
    </svg>
  );
}
