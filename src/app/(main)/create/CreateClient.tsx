"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const field = "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[0.95rem] text-fg";
const label = "mb-[7px] block text-[0.8rem] font-bold text-fg-soft";

export function CreateClient() {
  const router = useRouter();
  const { show } = useToast();
  const [cat, setCat] = useState("food");
  const [group, setGroup] = useState(4);
  const [title, setTitle] = useState("");

  const post = () => {
    if (!title.trim()) {
      show("Give your plan a title first", "✏️");
      return;
    }
    show("Plan posted — it's live on the map 👻", "🎉");
    setTimeout(() => router.push("/discover"), 900);
  };

  return (
    <>
      <TopBar variant="title" title="Create" />
      <Pad>
        <div className="pb-1.5 pt-[18px]">
          <h1 className="text-[1.7rem]">Start a plan</h1>
          <p className="mt-[5px] text-[0.92rem] text-fg-soft">
            Post what you want to do. People nearby request to join.
          </p>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="c-title">
            What&apos;s the plan?
          </label>
          <input
            id="c-title"
            className={field}
            placeholder="e.g. Suya run at Jimeta market"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <span className={label}>Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`inline-flex gap-1.5 rounded-full border px-3 py-[9px] text-[0.83rem] font-semibold ${
                  cat === c.id ? "border-violet bg-violet text-white" : "border-line bg-surface text-fg-soft"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="c-desc">
            Describe it
          </label>
          <textarea
            id="c-desc"
            className={`${field} min-h-[84px] resize-y`}
            placeholder="Pace, who it's for, what to bring, where you'll meet..."
          />
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="c-venue">
            Venue (public place)
          </label>
          <input id="c-venue" className={field} placeholder="Search Yola venues..." />
          <p className="mt-1.5 text-[0.74rem] text-fg-faint">
            🔒 Only the public venue shows publicly — never your home address.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[11px]">
          <div className="mt-4">
            <label className={label} htmlFor="c-date">
              Date
            </label>
            <select id="c-date" className={field}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This weekend</option>
              <option>Pick a date…</option>
            </select>
          </div>
          <div className="mt-4">
            <label className={label} htmlFor="c-time">
              Start time
            </label>
            <input id="c-time" className={field} defaultValue="7:30 PM" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[11px]">
          <div className="mt-4">
            <label className={label} htmlFor="c-cost">
              Cost / person (₦)
            </label>
            <input id="c-cost" className={field} placeholder="0 for free" />
          </div>
          <div className="mt-4">
            <span className={label}>Group size</span>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-2.5 py-[7px]">
              <button
                onClick={() => setGroup((g) => Math.max(2, g - 1))}
                className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-surface-2 text-[19px] font-bold"
                aria-label="Fewer"
              >
                −
              </button>
              <span className="font-display text-[1.1rem] font-bold">{group}</span>
              <button
                onClick={() => setGroup((g) => Math.min(20, g + 1))}
                className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-surface-2 text-[19px] font-bold"
                aria-label="More"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="c-join">
            Who can join?
          </label>
          <select id="c-join" className={field}>
            <option>Anyone can request</option>
            <option>Approve each request</option>
            <option>Invite only (share a link)</option>
          </select>
        </div>

        <div className="mt-6">
          <Button onClick={post}>Post plan 👻</Button>
        </div>
        <p className="mt-[18px] px-5 text-center text-[0.76rem] text-fg-faint">
          In the live app this saves to your account and appears on the map instantly.{" "}
          <span className="inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">
            Demo — not saved
          </span>
        </p>
      </Pad>
    </>
  );
}
