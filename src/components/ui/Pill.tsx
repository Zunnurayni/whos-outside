import type { ReactNode } from "react";

type Variant = "default" | "cat" | "good" | "warn" | "ghost";

const styles: Record<Variant, string> = {
  default: "bg-surface-2 text-fg-soft",
  cat: "bg-violet-soft text-violet",
  good: "text-good",
  warn: "text-warn",
  ghost: "bg-accent text-accent-ink",
};

export function Pill({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const extra = variant === "good" ? "bg-[color-mix(in_srgb,var(--good)_15%,transparent)]" : "";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]} ${extra} ${className}`}
    >
      {children}
    </span>
  );
}
