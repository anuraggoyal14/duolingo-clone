const AVATAR_COLORS: Record<string, string> = {
  green: "#58cc02",
  blue: "#1cb0f6",
  purple: "#ce82ff",
  orange: "#ff9600",
  pink: "#ff86d0",
  red: "#ff4b4b",
  teal: "#2bdcc5",
  yellow: "#ffc800",
};

export function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, background: AVATAR_COLORS[color] ?? "#afafaf", fontSize: size * 0.42 }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
