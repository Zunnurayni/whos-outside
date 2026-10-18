"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ActivityView } from "@/lib/types";
import { formatNaira } from "@/lib/categories";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { CategoryChips } from "@/components/activity/CategoryChips";
import { Avatar } from "@/components/ui/Avatar";

// Mapbox GL touches window, so load it client-only.
const MapboxMap = dynamic(() => import("@/components/map/MapboxMap").then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-surface-2" />,
});

/**
 * Social Radar / Explore screen.
 * With a Mapbox token (NEXT_PUBLIC_MAPBOX_TOKEN) it renders the real Yola map.
 * Without one it falls back to the stylised radar canvas. The category filter
 * and the floating activity card sit on top of either one.
 */
export function MapClient({
  activities,
  mapboxToken,
}: {
  activities: ActivityView[];
  mapboxToken: string;
}) {
  const [cat, setCat] = useState("all");
  const [focusId, setFocusId] = useState(activities[0]?.id ?? "");

  const filtered = useMemo(
    () => activities.filter((a) => cat === "all" || a.category === cat),
    [activities, cat]
  );
  const focus =
    filtered.find((a) => a.id === focusId) ??
    filtered[0] ??
    activities.find((a) => a.id === focusId) ??
    activities[0];

  const useReal = Boolean(mapboxToken);

  return (
    <>
      <TopBar
        variant="title"
        title="Social Radar"
        subtitle={useReal ? "Yola & Jimeta live map" : "Yola & Jimeta live pins"}
      />
      <div
        className="relative"
        style={{
          height: "calc(100dvh - 58px - 82px - env(safe-area-inset-top, 0px))",
          minHeight: 460,
        }}
      >
        {useReal ? (
          <MapboxMap
            token={mapboxToken}
            activities={filtered}
            focusId={focus?.id ?? ""}
            onFocus={setFocusId}
          />
        ) : (
          <RadarCanvas
            activities={activities}
            cat={cat}
            focusId={focus?.id ?? ""}
            onFocus={setFocusId}
          />
        )}

        {/* Top Category Filter Bar */}
        <div className="absolute inset-x-0 top-3 z-30">
          <CategoryChips active={cat} onChange={setCat} />
        </div>

        {/* Floating Selected Activity Card at Bottom */}
        <div className="absolute inset-x-0 bottom-4 z-30 px-4">
          {focus && (
            <div className="animate-in slide-in-from-bottom duration-200">
              <ActivityCard activity={focus} joined={focus.crew.includes("me")} />
            </div>
          )}
          {!useReal && (
            <p className="mt-2 text-center text-[0.72rem] text-fg-faint">
              Stylised radar.{" "}
              <span className="inline-block rounded-md bg-surface-2 px-2 py-[2px] text-[0.64rem] font-bold uppercase tracking-wide text-fg-faint">
                Add a Mapbox token for the live map
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/** The redesigned stylised "radar" map, used when no Mapbox token is set. */
function RadarCanvas({
  activities,
  cat,
  focusId,
  onFocus,
}: {
  activities: ActivityView[];
  cat: string;
  focusId: string;
  onFocus: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-900">
      {/* Subtle Grid Lines */}
      <div
        className="absolute inset-[-50%] opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#352e4a 1px, transparent 1px), linear-gradient(90deg, #352e4a 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* River Benue Waterway Ribbon */}
      <div
        className="absolute -left-[15%] -right-[15%] top-[52%] h-[80px] blur-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(108, 76, 240, 0.4), rgba(47, 158, 111, 0.25), transparent)",
          transform: "rotate(-6deg)",
        }}
      />

      {/* Road Networks */}
      <div
        className="absolute bottom-0 top-0 left-[18%] w-2 bg-white/10"
        style={{ transform: "rotate(5deg)" }}
      />
      <div className="absolute inset-x-0 top-[42%] h-2 bg-white/10" />
      <div
        className="absolute bottom-0 top-0 right-[25%] w-1.5 bg-white/10"
        style={{ transform: "rotate(-8deg)" }}
      />

      {/* You (User Location Pulse) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        style={{ left: "46%", top: "48%" }}
      >
        <div className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <div className="grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-accent text-[9px] font-bold text-accent-ink shadow-md">
            You
          </div>
        </div>
      </div>

      {/* Activity Social Pins */}
      {activities.map((a) => {
        const show = cat === "all" || a.category === cat;
        const isSelected = a.id === focusId;
        return (
          <button
            key={a.id}
            onClick={() => onFocus(a.id)}
            className={`absolute -translate-x-1/2 -translate-y-full z-30 flex flex-col items-center transition-all duration-200 focus:outline-none ${
              show ? "opacity-100 scale-100" : "opacity-30 scale-90 pointer-events-none"
            }`}
            style={{ left: `${a.mapX}%`, top: `${a.mapY}%` }}
            aria-label={a.title}
          >
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${
                isSelected
                  ? "border-accent bg-accent text-accent-ink scale-110 shadow-xl"
                  : "border-line/80 bg-surface/95 text-fg shadow-md backdrop-blur-md hover:scale-105"
              }`}
            >
              <Avatar personId={a.hostId} size={20} />
              <span>{a.emoji}</span>
              <span className={isSelected ? "text-accent-ink" : "text-violet font-extrabold"}>
                {a.cost === 0 ? "Free" : formatNaira(a.cost)}
              </span>
            </div>
            <div className={`h-2 w-1 ${isSelected ? "bg-accent" : "bg-line"}`} />
          </button>
        );
      })}
    </div>
  );
}
