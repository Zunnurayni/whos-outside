"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discover", icon: "🏠", label: "Discover" },
  { href: "/map", icon: "🗺️", label: "Map" },
  { href: "/create", icon: "＋", label: "Create", big: true },
  { href: "/crews", icon: "👥", label: "Crews" },
  { href: "/profile", icon: "😎", label: "You" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-[55] flex w-full max-w-app -translate-x-1/2 border-t border-line bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {TABS.map((t) => {
        const active = path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex flex-1 flex-col items-center gap-[3px] pb-2 pt-[9px] text-[0.62rem] font-semibold tracking-wide ${
              active ? "text-fg" : "text-fg-faint"
            }`}
          >
            {t.big ? (
              <span className="-mt-2 grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-accent text-2xl text-accent-ink shadow-card">
                {t.icon}
              </span>
            ) : (
              <span className="text-[21px] leading-none">{t.icon}</span>
            )}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
