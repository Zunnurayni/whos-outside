"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

interface Props {
  variant?: "home" | "title" | "detail";
  title?: string;
}

export function TopBar({ variant = "title", title = "" }: Props) {
  const router = useRouter();
  const { show } = useToast();

  return (
    <header
      className="sticky z-50 flex min-h-[58px] items-center gap-3 border-b border-line bg-surface py-3"
      style={{
        top: "env(safe-area-inset-top, 0px)",
        paddingLeft: "max(18px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(18px, env(safe-area-inset-right, 0px))",
      }}
    >
      {variant === "detail" ? (
        <>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-[22px] text-fg-soft active:scale-90"
          >
            ‹
          </button>
          <span className="font-display text-[1.15rem] font-semibold">Activity</span>
          <div className="flex-1" />
          <button
            onClick={() => show("Snapchat share card generated (deep-links back here) 👻", "⤴")}
            aria-label="Share"
            className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-[19px] text-fg-soft active:scale-90"
          >
            ⤴
          </button>
        </>
      ) : variant === "home" ? (
        <>
          <Link href="/discover" className="flex items-center gap-2.5 font-display text-[1.15rem] font-semibold tracking-tight">
            <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-accent text-[17px] text-accent-ink">
              👻
            </span>
            Who&apos;s Outside
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <button
            onClick={() => show("3 new: 1 join request, 2 plans filling", "🔔")}
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-[19px] text-fg-soft active:scale-90"
          >
            <span className="absolute right-[9px] top-2 h-2 w-2 rounded-full bg-crit ring-2 ring-surface" />
            🔔
          </button>
        </>
      ) : (
        <>
          <span className="font-display text-[1.15rem] font-semibold">{title}</span>
          <div className="flex-1" />
          <ThemeToggle />
        </>
      )}
    </header>
  );
}
