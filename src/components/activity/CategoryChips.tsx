"use client";

import { CATEGORIES } from "@/lib/categories";

export function CategoryChips({
  active,
  onChange,
  inset = true,
}: {
  active: string;
  onChange: (id: string) => void;
  inset?: boolean;
}) {
  return (
    <div
      className="no-scrollbar flex gap-[9px] overflow-x-auto pb-1.5 pt-4"
      style={
        inset
          ? {
              paddingLeft: "max(18px, env(safe-area-inset-left, 0px))",
              paddingRight: "max(18px, env(safe-area-inset-right, 0px))",
            }
          : undefined
      }
    >
      {CATEGORIES.map((c) => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex flex-none items-center gap-1.5 rounded-full border px-[15px] py-[9px] text-[0.84rem] font-semibold transition-colors ${
              on ? "border-fg bg-fg text-bg" : "border-line bg-surface text-fg-soft"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        );
      })}
    </div>
  );
}
