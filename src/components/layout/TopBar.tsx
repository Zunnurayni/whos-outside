"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/Logo";

interface Props {
  variant?: "home" | "title" | "detail";
  title?: string;
  subtitle?: string;
  onShare?: () => void;
  unreadCount?: number;
}

export function TopBar({ variant = "title", title = "", subtitle, onShare, unreadCount = 0 }: Props) {
  const router = useRouter();
  const { show } = useToast();

  const handleDefaultShare = () => {
    if (onShare) {
      onShare();
    } else {
      show("Snapchat sticker card generated (deep-links back here) 👻", "⤴");
    }
  };

  return (
    <header
      className="sticky z-50 flex min-h-[58px] items-center justify-between gap-3 border-b border-line/70 bg-surface/95 backdrop-blur-md px-4 py-2.5"
      style={{
        top: "env(safe-area-inset-top, 0px)",
      }}
    >
      {variant === "detail" ? (
        <>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-fg transition-transform active:scale-90"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
            </button>
            <div>
              <div className="font-display text-[1.05rem] font-bold text-fg leading-tight">
                {title || "Activity"}
              </div>
              {subtitle && <div className="text-[0.72rem] text-fg-soft">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDefaultShare}
              aria-label="Share"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-fg transition-transform active:scale-90"
            >
              <Share2 className="h-4 w-4 stroke-[2]" />
            </button>
            <ThemeToggle />
          </div>
        </>
      ) : variant === "home" ? (
        <>
          <Link href="/discover" className="flex items-center gap-2.5 focus:outline-none">
            <Logo size={32} rounded={9} className="block shrink-0" />
            <div className="flex flex-col">
              <span className="font-display text-[1.12rem] font-bold tracking-tight text-fg leading-none">
                Who&apos;s Outside?
              </span>
              <span className="mt-0.5 text-[0.68rem] font-semibold text-violet">
                14 outside right now
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/notifications"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-fg transition-transform active:scale-90"
            >
              <Bell className="h-4 w-4 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-crit px-1 text-[0.62rem] font-bold text-white ring-2 ring-surface">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </>
      ) : (
        <>
          <div>
            <span className="font-display text-[1.15rem] font-bold text-fg">{title}</span>
            {subtitle && <div className="text-[0.72rem] text-fg-soft">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </>
      )}
    </header>
  );
}
