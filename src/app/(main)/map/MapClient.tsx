"use client";

import { useState } from "react";
import type { ActivityView } from "@/lib/types";
import { formatNaira } from "@/lib/categories";
import { TopBar } from "@/components/layout/TopBar";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { CategoryChips } from "@/components/activity/CategoryChips";

/**
 * Stylised map of Yola / Jimeta. This is the Phase 1 placeholder; in Phase 3
 * swap the .map-canvas block for a Mapbox GL or Google Maps view and feed it
 * get_nearby_activities(). The pin + floating-card interaction stays the same.
 */
export function MapClient({ activities }: { activities: ActivityView[] }) {
  const [cat, setCat] = useState("all");
  const [focusId, setFocusId] = useState(activities[0]?.id ?? "");
  const focus = activities.find((a) => a.id === focusId) ?? activities[0];

  return (
    <>
      <TopBar variant="title" title="Explore" />
      <div className="relative" style={{ height: "calc(100dvh - 58px - 92px - env(safe-area-inset-top,0px))", minHeight: 420 }}>
        {/* canvas */}
        <div className="absolute inset-0 overflow-hidden bg-surface-2">
          <div
            className="absolute inset-[-50%] opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />
          {/* River Benue */}
          <div
            className="absolute -left-[10%] -right-[10%] top-[54%] h-[70px] blur-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in srgb, var(--violet) 22%, var(--surface-2)), transparent)",
              transform: "rotate(-7deg)",
            }}
          />
          {/* roads */}
          <div className="absolute bottom-0 top-0 left-[10%] w-1.5 bg-surface opacity-80" style={{ transform: "rotate(4deg)" }} />
          <div className="absolute inset-x-0 top-[45%] h-1.5 bg-surface opacity-80" />
          {/* you */}
          <div
            className="absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-violet"
            style={{ left: "45%", top: "48%", boxShadow: "0 0 0 6px color-mix(in srgb, var(--violet) 20%, transparent)" }}
          />
          {/* pins */}
          {activities.map((a) => {
            const show = cat === "all" || a.category === cat;
            const hot = a.id === focus?.id;
            return (
              <button
                key={a.id}
                onClick={() => setFocusId(a.id)}
                className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                style={{ left: `${a.mapX}%`, top: `${a.mapY}%`, opacity: show ? 1 : 0.28 }}
                aria-label={a.title}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-[13px] border bg-surface px-[9px] py-1.5 text-[0.74rem] font-bold shadow-card ${
                    hot ? "border-accent" : "border-line"
                  }`}
                  style={hot ? { boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent), var(--shadow)" } : undefined}
                >
                  <span className="text-[15px]">{a.emoji}</span>
                  <span className="text-violet">{a.cost === 0 ? "Free" : formatNaira(a.cost)}</span>
                </div>
                <div className="h-[9px] w-0.5 bg-line" />
              </button>
            );
          })}
        </div>

        {/* filters */}
        <div className="absolute inset-x-0 top-3">
          <CategoryChips active={cat} onChange={setCat} />
        </div>

        {/* floating focus card */}
        <div
          className="absolute inset-x-0 bottom-3.5"
          style={{
            paddingLeft: "max(14px, env(safe-area-inset-left,0px))",
            paddingRight: "max(14px, env(safe-area-inset-right,0px))",
          }}
        >
          {focus && <ActivityCard activity={focus} joined={focus.crew.includes("me")} />}
          <p className="mt-[9px] text-center text-[0.76rem] text-fg-faint">
            Stylised map of Yola / Jimeta.{" "}
            <span className="inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">
              Demo
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
