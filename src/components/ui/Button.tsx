import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "violet" | "ghostline";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink",
  secondary: "bg-surface-2 text-fg",
  violet: "bg-violet text-white",
  ghostline: "bg-transparent border border-line text-fg",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "sm";
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  full = true,
  className = "",
  children,
  ...rest
}: Props) {
  const sizeCls = size === "sm" ? "px-3.5 py-2 text-sm rounded-[11px]" : "px-5 py-3.5 text-[0.95rem] rounded-[14px]";
  const width = full ? "w-full" : "w-auto";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold transition-transform active:scale-[0.97] ${variants[variant]} ${sizeCls} ${width} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
