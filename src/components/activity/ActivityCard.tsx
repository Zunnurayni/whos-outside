import Link from "next/link";
import type { ActivityView } from "@/lib/types";
import { categoryEmoji, categoryLabel, formatNaira } from "@/lib/categories";
import { spotsLeft } from "@/lib/data/activities";
import { Pill } from "@/components/ui/Pill";

export function ActivityCard({ activity: a, joined = false }: { activity: ActivityView; joined?: boolean }) {
  const sl = spotsLeft(a);
  return (
    <Link
      href={`/activities/${a.id}`}
      className="flex w-full flex-col gap-[11px] rounded-md border border-line bg-surface p-[15px] text-left shadow-card transition-transform active:scale-[0.985]"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-[50px] w-[50px] flex-none place-items-center rounded-[14px] bg-surface-2 text-[25px]">
          {a.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[1.04rem] font-bold">{a.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.82rem] text-fg-soft">
            📍 {a.venue}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-[7px]">
            <Pill variant="cat">
              {categoryEmoji(a.category)} {categoryLabel(a.category)}
            </Pill>
            <span className="text-[0.78rem] font-bold text-fg">{formatNaira(a.cost)}</span>
            {joined && <Pill variant="good">✓ Joined</Pill>}
          </div>
        </div>
      </div>
      <hr className="h-px border-0 bg-line" />
      <div className="flex items-center justify-between gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-fg-soft">
          🗓️ {a.day}, {a.time}
        </span>
        {a.status === "filling" ? (
          <span className="inline-flex items-center gap-1.5 text-[0.74rem] font-bold text-warn">
            🔥 {sl} spot{sl === 1 ? "" : "s"} left
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-fg-soft">
            👥 {a.crew.length}/{a.max} in
          </span>
        )}
      </div>
    </Link>
  );
}
