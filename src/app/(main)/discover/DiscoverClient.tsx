"use client";

import { useState } from "react";
import Link from "next/link";
import type { ActivityView, EventView } from "@/lib/types";
import { categoryEmoji, categoryLabel, formatNaira } from "@/lib/categories";
import { spotsLeft } from "@/lib/data/activities";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { CategoryChips } from "@/components/activity/CategoryChips";
import { AvatarStack } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";

export function DiscoverClient({
  activities,
  events,
}: {
  activities: ActivityView[];
  events: EventView[];
}) {
  const [cat, setCat] = useState<string>("all");
  const feat = activities.find((a) => a.id === "a6") ?? activities[0];
  const list = activities.filter((a) => cat === "all" || a.category === cat);

  return (
    <>
      <TopBar variant="home" />

      <Pad className="pb-1.5 pt-[18px]">
        <h1 className="text-[1.7rem] tracking-tight">Who&apos;s outside, Nurain? 👻</h1>
        <p className="mt-[5px] text-[0.92rem] text-fg-soft">Find your people. Experience more of life.</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-[7px] text-[0.8rem] font-semibold text-fg-soft">
          📍 Yola, Adamawa · 10km radius
        </span>
      </Pad>

      <CategoryChips active={cat} onChange={setCat} />

      <Pad>
        {cat === "all" && feat && (
          <>
            <div className="mb-[13px] mt-[22px] flex items-baseline justify-between">
              <h2 className="text-[1.18rem]">Tonight&apos;s spotlight</h2>
            </div>
            <Link
              href={`/activities/${feat.id}`}
              className="relative mb-2 flex min-h-[220px] flex-col justify-end overflow-hidden rounded-lg text-white shadow-card"
              style={{ background: "linear-gradient(135deg, #2a2440, #4b3a9e 60%, #6c4cf0)" }}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background:
                    "radial-gradient(circle at 80% 15%, rgba(255,212,0,.35), transparent 42%), radial-gradient(circle at 15% 85%, rgba(255,255,255,.14), transparent 45%)",
                }}
              />
              <div className="absolute inset-x-4 top-4 flex items-start justify-between">
                <Pill variant="ghost">🔥 Filling fast</Pill>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  {spotsLeft(feat)} spots left
                </span>
              </div>
              <div className="relative p-[18px]">
                <div className="text-[0.7rem] font-bold uppercase tracking-wider text-white/75">
                  {categoryLabel(feat.category)} · {feat.area}
                </div>
                <h3 className="mb-1.5 text-[1.4rem] text-white">{feat.title}</h3>
                <div className="mb-3.5 flex flex-wrap gap-3.5 text-[0.85rem] text-white/90">
                  <span>🗓️ {feat.day}, {feat.time}</span>
                  <span>💸 {formatNaira(feat.cost)}</span>
                </div>
                <AvatarStack ids={feat.crew} />
              </div>
            </Link>
          </>
        )}

        <div className="mb-[13px] mt-[22px] flex items-baseline justify-between">
          <h2 className="text-[1.18rem]">
            {cat === "all" ? "Happening near you" : `${categoryLabel(cat as any)} near you`}
          </h2>
          <span className="text-[0.82rem] font-bold text-violet">{list.length} plans</span>
        </div>
        <div className="flex flex-col gap-[13px]">
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} joined={a.crew.includes("me")} />
          ))}
        </div>

        {cat === "all" && (
          <>
            <div className="mb-[13px] mt-7 flex items-baseline justify-between">
              <h2 className="text-[1.18rem]">Organised events</h2>
              <Link href="/map" className="text-[0.82rem] font-bold text-violet">
                On map ›
              </Link>
            </div>
            <div className="flex flex-col gap-[13px]">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </>
        )}

        <p className="mt-[18px] px-5 text-center text-[0.76rem] text-fg-faint">
          Sample plans and people shown for Yola / Adamawa.{" "}
          <span className="inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">
            Demo data
          </span>
        </p>
      </Pad>
    </>
  );
}

function EventCard({ event: e }: { event: EventView }) {
  return (
    <div className="flex w-full flex-col gap-[11px] rounded-md border border-line bg-surface p-[15px] shadow-card">
      <div className="flex items-start gap-3">
        <div className="grid h-[50px] w-[50px] flex-none place-items-center rounded-[14px] bg-surface-2 text-[25px]">
          {e.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[1.04rem] font-bold">{e.title}</div>
          <div className="mt-0.5 text-[0.82rem] text-fg-soft">🏷️ {e.org} · verified organiser</div>
          <div className="mt-2 flex flex-wrap items-center gap-[7px]">
            <Pill>🗓️ {e.day}</Pill>
            <Pill>📍 {e.venue}</Pill>
          </div>
        </div>
      </div>
      <hr className="h-px border-0 bg-line" />
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[0.8rem] font-semibold text-fg-soft">⭐ {e.interested} interested</span>
        <span className="rounded-[11px] bg-surface-2 px-3.5 py-2 text-sm font-bold text-fg">I&apos;m interested</span>
      </div>
    </div>
  );
}
