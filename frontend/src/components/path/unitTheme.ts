import type { UnitColor } from "@/lib/types";

/** Static class names per unit color (Tailwind needs literal class strings). */
export const UNIT_THEME: Record<UnitColor, { bg: string; lip: string; text: string; hex: string; lipHex: string }> = {
  green: { bg: "bg-owl", lip: "border-owl-dark", text: "text-owl", hex: "#58cc02", lipHex: "#58a700" },
  blue: { bg: "bg-sky", lip: "border-sky-dark", text: "text-sky", hex: "#1cb0f6", lipHex: "#1899d6" },
  purple: { bg: "bg-beetle", lip: "border-beetle-dark", text: "text-beetle", hex: "#ce82ff", lipHex: "#a568cc" },
  orange: { bg: "bg-fox", lip: "border-fox-dark", text: "text-fox", hex: "#ff9600", lipHex: "#e58600" },
  pink: { bg: "bg-[#ff86d0]", lip: "border-[#e070b4]", text: "text-[#ff86d0]", hex: "#ff86d0", lipHex: "#e070b4" },
};
