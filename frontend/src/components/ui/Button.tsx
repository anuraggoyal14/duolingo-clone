import { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "super"
  | "outline"
  | "ghost"
  | "locked"
  | "white";

// The signature "3D" button: a darker bottom border that collapses when pressed.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-owl text-white border-owl-dark hover:brightness-105",
  secondary: "bg-sky text-white border-sky-dark hover:brightness-105",
  danger: "bg-cardinal text-white border-cardinal-dark hover:brightness-105",
  super: "bg-beetle text-white border-beetle-dark hover:brightness-105",
  outline: "bg-panel text-sky border-line border-2 hover:bg-hover",
  ghost: "bg-transparent text-sky border-transparent hover:bg-hover",
  locked: "bg-locked text-faint border-locked-shadow cursor-not-allowed",
  white: "bg-white text-owl-text border-[#e5e5e5]",
};

const SIZES = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[50px] px-8 text-[15px]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth, className = "", disabled, ...props },
  ref,
) {
  const look = disabled ? VARIANTS.locked : VARIANTS[variant];
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl border-b-4 font-extrabold uppercase tracking-wide transition-[filter,transform] duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
        disabled ? "" : "active:translate-y-[2px] active:border-b-2",
        SIZES[size],
        fullWidth ? "w-full" : "",
        look,
        className,
      ].join(" ")}
      {...props}
    />
  );
});
