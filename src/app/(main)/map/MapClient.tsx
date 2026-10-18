"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, Compass, Layers, Clock, Flame } from "lucide-react";
import type { ActivityView } from "@/lib/types";
import { formatNaira } from "@/lib/categories";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { CategoryChips } from "@/components/activity/CategoryChips";
import { Avatar } from "@/components/ui/Avatar";

export function MapClient({ activities }: { activities: ActivityView[] }) {
  const [cat, setCat] = useState("all");
  const [focusId, setFocusId] = useState(activities[0]?.id ?? "");
  const focus = activities.find((a) => a.id === focusId) ?? activities[0];

  return (
    <>
      <TopBar variant="title" title="Social Radar" subtitle="Yola & Jimeta live pins" />
      <div
        className="relative"
        style={{
          height: "calc(100dvh - 58px - 82px - env(safe-area-inset-top, 0px))",
          minHeight: 460,
        }}
      >
        {/* Radar Map Canvas */}
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
            const isSelected = a.id === focus?.id;
            const host = personById(a.hostId);

            return (
              <button
                key={a.id}
                onClick={() => setFocusId(a.id)}
                className={`absolute -translate-x-1/2 -translate-y-full z-30 flex flex-col items-center transition-all duration-200 focus:outline-none ${
                  show ? "opacity-100 scale-100" : "opacity-30 scale-90 pointer-events-none"
                }`}
                style={{ left: `${a.mapX}%`, top: `${a.mapY}%` }}
                aria-label={a.title}
              >
                {/* Pin Card */}
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
                {/* Pointer Arrow */}
                <div
                  className={`h-2 w-1 ${
                    isSelected ? "bg-accent" : "bg-line"
                  }`}
                />
              </button>
            );
          })}
        </div>

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
        </div>
      </div>
    </>
  );
}
