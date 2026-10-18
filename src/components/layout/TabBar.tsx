"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPin, Plus, Users, User } from "lucide-react";

export function TabBar() {
  const path = usePathname();

  const tabs = [
    {
      href: "/discover",
      icon: Compass,
      label: "Discover",
      active: path === "/discover" || path === "/",
    },
    {
      href: "/map",
      icon: MapPin,
      label: "Radar",
      active: path.startsWith("/map"),
    },
    {
      href: "/create",
      icon: Plus,
      label: "Create",
      big: true,
      active: path.startsWith("/create"),
    },
    {
      href: "/crews",
      icon: Users,
      label: "Crews",
      active: path.startsWith("/crews"),
      badge: "2",
    },
    {
      href: "/profile",
      icon: User,
      label: "You",
      active: path.startsWith("/profile"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-[55] flex w-full max-w-app -translate-x-1/2 items-center justify-around border-t border-line/70 bg-surface/95 backdrop-blur-md px-2 py-1.5"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Main Navigation"
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        if (t.big) {
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group relative -mt-5 flex flex-col items-center focus:outline-none"
              aria-label="Create Plan"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-ink shadow-md transition-all group-active:scale-95 group-hover:shadow-lg">
                <Icon className="h-6 w-6 stroke-[2.4]" />
              </div>
              <span className="mt-1 text-[10px] font-bold tracking-tight text-fg-soft">
                {t.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex min-h-[44px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl py-1 text-center transition-all active:scale-95 ${
              t.active ? "text-fg font-bold" : "text-fg-faint hover:text-fg-soft font-medium"
            }`}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 transition-transform ${
                  t.active ? "stroke-[2.4] text-violet" : "stroke-[1.8]"
                }`}
              />
              {t.badge && (
                <span className="absolute -right-2 -top-1 grid h-4 w-4 place-items-center rounded-full bg-crit text-[9px] font-extrabold text-white">
                  {t.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
