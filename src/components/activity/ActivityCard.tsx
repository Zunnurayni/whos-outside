import Link from "next/link";
import { Clock, MapPin, Users, Flame, ArrowUpRight } from "lucide-react";
import type { ActivityView } from "@/lib/types";
import { categoryLabel, formatNaira, spotsLeft } from "@/lib/categories";
import { personById } from "@/lib/data/sample";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";

export function ActivityCard({
  activity: a,
  joined = false,
}: {
  activity: ActivityView;
  joined?: boolean;
}) {
  const host = personById(a.hostId);
  const sl = spotsLeft(a);
  const pct = Math.min(100, Math.round((a.crew.length / a.max) * 100));
  const isUrgent = sl <= 2 && a.status === "filling";

  return (
    <Link
      href={`/activities/${a.id}`}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface text-left shadow-card transition-all duration-200 active:scale-[0.98] hover:border-violet/40 hover:shadow-lg"
    >
      {/* Top Banner with subtle atmospheric background */}
      <div
        className={`relative overflow-hidden px-4 pt-3.5 pb-2.5 bg-gradient-to-r ${
          a.themeGradient || "from-surface-2 via-surface to-surface"
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-black/40 text-lg backdrop-blur-sm">
              {a.emoji}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                {categoryLabel(a.category)}
              </span>
              <span className="text-[12px] font-medium text-white/90">
                Hosted by {host.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isUrgent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-extrabold text-accent-ink">
                <Flame className="h-3 w-3 fill-current" />
                {sl} left
              </span>
            ) : (
              <span className="rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-white">
                {sl} spots open
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-2.5 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[1.18rem] font-bold leading-tight text-fg group-hover:text-violet transition-colors">
              {a.title}
            </h3>
            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-surface-2 text-fg-soft group-hover:bg-violet group-hover:text-white transition-colors">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Clean Unboxed Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-fg-soft">
            <span className="flex items-center gap-1 text-fg">
              <MapPin className="h-3.5 w-3.5 text-violet shrink-0" />
              <strong className="font-semibold">{a.venue}</strong>
            </span>
            <span aria-hidden="true" className="text-line">·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {a.day}, {a.time}
            </span>
          </div>
        </div>

        {/* Vibe Tags */}
        {a.vibes && a.vibes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {a.vibes.slice(0, 3).map((vibe) => (
              <span
                key={vibe}
                className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-soft"
              >
                #{vibe}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar & Footer */}
        <div className="mt-1 flex flex-col gap-1.5 border-t border-line/60 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AvatarStack ids={a.crew} size={24} max={3} />
              <span className="text-[11px] font-medium text-fg-soft">
                {a.crew.length} pulled up
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-[0.95rem] font-extrabold text-fg tabular-nums">
                {a.cost === 0 ? "Free" : formatNaira(a.cost)}
              </span>
              {joined && (
                <span className="rounded-md bg-good/15 px-2 py-0.5 text-[11px] font-bold text-good">
                  ✓ In
                </span>
              )}
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isUrgent ? "bg-accent" : "bg-violet"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
