// Simplified, hand-drawn flag icons (rounded rectangles like the original app's course flags).

type FlagProps = { className?: string };

function Frame({ children, label, className = "h-7 w-9" }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 36 26" className={className} role="img" aria-label={label}>
      <defs>
        <clipPath id={`flag-${label}`}>
          <rect width="36" height="26" rx="5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-${label})`}>{children}</g>
      <rect width="35" height="25" x=".5" y=".5" rx="4.5" fill="none" stroke="rgba(0,0,0,.12)" />
    </svg>
  );
}

export const SpainFlag = ({ className }: FlagProps) => (
  <Frame label="Spanish" className={className}>
    <rect width="36" height="26" fill="#c60b1e" />
    <rect y="6.5" width="36" height="13" fill="#ffc400" />
    <rect x="9" y="10" width="5" height="6" rx="1" fill="#c60b1e" opacity=".8" />
  </Frame>
);

export const FranceFlag = ({ className }: FlagProps) => (
  <Frame label="French" className={className}>
    <rect width="12" height="26" fill="#0055a4" />
    <rect x="12" width="12" height="26" fill="#fff" />
    <rect x="24" width="12" height="26" fill="#ef4135" />
  </Frame>
);

export const GermanyFlag = ({ className }: FlagProps) => (
  <Frame label="German" className={className}>
    <rect width="36" height="9" fill="#222" />
    <rect y="8.6" width="36" height="8.8" fill="#dd0000" />
    <rect y="17.3" width="36" height="8.7" fill="#ffce00" />
  </Frame>
);

export const ItalyFlag = ({ className }: FlagProps) => (
  <Frame label="Italian" className={className}>
    <rect width="12" height="26" fill="#009246" />
    <rect x="12" width="12" height="26" fill="#fff" />
    <rect x="24" width="12" height="26" fill="#ce2b37" />
  </Frame>
);

export const JapanFlag = ({ className }: FlagProps) => (
  <Frame label="Japanese" className={className}>
    <rect width="36" height="26" fill="#fff" />
    <circle cx="18" cy="13" r="7" fill="#bc002d" />
  </Frame>
);

export const BrazilFlag = ({ className }: FlagProps) => (
  <Frame label="Portuguese" className={className}>
    <rect width="36" height="26" fill="#009c3b" />
    <path d="M18 3 33 13 18 23 3 13z" fill="#ffdf00" />
    <circle cx="18" cy="13" r="5.5" fill="#002776" />
  </Frame>
);

export const IndiaFlag = ({ className }: FlagProps) => (
  <Frame label="Hindi" className={className}>
    <rect width="36" height="9" fill="#ff9933" />
    <rect y="8.6" width="36" height="8.8" fill="#fff" />
    <rect y="17.3" width="36" height="8.7" fill="#138808" />
    <circle cx="18" cy="13" r="3" fill="none" stroke="#000080" strokeWidth="1" />
  </Frame>
);

export const KoreaFlag = ({ className }: FlagProps) => (
  <Frame label="Korean" className={className}>
    <rect width="36" height="26" fill="#fff" />
    <path d="M12.5 13a5.5 5.5 0 0 1 11 0z" fill="#cd2e3a" />
    <path d="M12.5 13a5.5 5.5 0 0 0 11 0z" fill="#0047a0" />
    <g stroke="#222" strokeWidth="1.4">
      <path d="M4 5.5l3-2.5M5 7l3-2.5M6 8.5l3-2.5M27 17.5l3 2.5M28 16l3 2.5M29 14.5l3 2.5" />
    </g>
  </Frame>
);

export const NetherlandsFlag = ({ className }: FlagProps) => (
  <Frame label="Dutch" className={className}>
    <rect width="36" height="9" fill="#ae1c28" />
    <rect y="8.6" width="36" height="8.8" fill="#fff" />
    <rect y="17.3" width="36" height="8.7" fill="#21468b" />
  </Frame>
);
