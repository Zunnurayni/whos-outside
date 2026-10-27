"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Radio, X } from "lucide-react";
import { PEOPLE, SAMPLE_ACTIVITIES } from "@/lib/data/sample";
import type { Person } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

export function OutsidePulseBar() {
  const { show } = useToast();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const outsidePeople = Object.values(PEOPLE).filter((p) => p.isOutside);

  const handleWave = (p: Person) => {
    show(`You waved at ${p.name} 👋 They were notified!`, "👋");
    setSelectedPerson(null);
  };

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-good" />
          </span>
          <span className="font-display text-[0.85rem] font-bold text-fg tracking-tight">
            Who&apos;s Outside Right Now
          </span>
        </div>
        <span className="text-[0.72rem] font-medium text-fg-soft">
          {outsidePeople.length} outside now
        </span>
      </div>

      {/* Horizontal Story Scroller */}
      <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-4 py-1">
        {outsidePeople.map((person) => {
          const isMe = person.id === "me";
          return (
            <button
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className="group flex flex-col items-center gap-1.5 text-center focus:outline-none flex-none"
            >
              <div className="relative">
                <div className="grid place-items-center rounded-full p-[2px] bg-gradient-to-tr from-accent via-violet to-good shadow-sm transition-transform group-active:scale-95">
                  <div className="rounded-full bg-surface p-[2px]">
                    <Avatar personId={person.id} size={46} />
                  </div>
                </div>
                {isMe ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 py-0.2 text-[8px] font-extrabold uppercase text-accent-ink">
                    You
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-0.5 rounded-full bg-good p-0.5 text-[10px] ring-2 ring-surface">
                    <Radio className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
              <span className="w-16 truncate text-[11px] font-bold text-fg">
                {isMe ? "You" : person.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Vibe Sheet / Dialog */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-app rounded-2xl border border-line bg-surface p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full ring-2 ring-accent">
                  <Avatar personId={selectedPerson.id} size={50} />
                </div>
                <div>
                  <div className="font-display text-[1.1rem] font-bold text-fg">
                    {selectedPerson.name}
                  </div>
                  <div className="text-[0.78rem] text-fg-soft">{selectedPerson.handle}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-fg-soft"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-surface-2 p-3.5">
              <div className="flex items-center gap-1.5 text-[0.74rem] font-bold uppercase tracking-wider text-violet">
                <Sparkles className="h-3.5 w-3.5" /> Current Vibe
              </div>
              <div className="mt-1 text-[0.95rem] font-semibold text-fg">
                {selectedPerson.vibe || "Out and exploring!"}
              </div>
              {selectedPerson.currentSpot && (
                <div className="mt-2 flex items-center gap-1.5 text-[0.78rem] text-fg-soft">
                  <MapPin className="h-3.5 w-3.5 text-good" />
                  Spotted at <strong className="text-fg">{selectedPerson.currentSpot}</strong>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleWave(selectedPerson)}
                className="flex-1 rounded-xl border border-line bg-surface py-3 text-[0.88rem] font-bold text-fg active:scale-95 transition-transform"
              >
                Wave 👋
              </button>
              {selectedPerson.id !== "me" && (
                <Link
                  href={`/activities/${
                    SAMPLE_ACTIVITIES.find((a) => a.hostId === selectedPerson.id)?.id || "a1"
                  }`}
                  onClick={() => setSelectedPerson(null)}
                  className="flex-1 rounded-xl bg-accent py-3 text-center text-[0.88rem] font-bold text-accent-ink active:scale-95 transition-transform"
                >
                  See Their Plan ⚡
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
