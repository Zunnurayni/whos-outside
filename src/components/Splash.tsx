"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

// First-open splash. Shows once per browser session (sessionStorage), overlays
// everything, then fades out on its own. Pure CSS motion so it paints instantly;
// JS only decides whether to show it and when to unmount. Respects reduced motion.
export function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("wo-splash") === "1";
    } catch {
      // private mode / blocked storage — just show it, harmless
    }
    if (seen) return;

    setShow(true);
    try {
      sessionStorage.setItem("wo-splash", "1");
    } catch {}

    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(130% 90% at 50% 18%, #2a251f 0%, #141210 62%)",
        animation: "wo-splash-out 2.2s ease forwards",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="wo-pop">
          <div className="wo-float wo-glow rounded-[26px]">
            <Logo size={96} rounded={26} className="block" />
          </div>
        </div>

        <h1
          className="mt-7 text-center text-[1.9rem] font-extrabold leading-tight text-[#f6f1e9] wo-rise wo-rise-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Who&apos;s outside?
        </h1>
        <p className="mt-1 text-center text-[0.95rem] font-semibold text-accent wo-rise wo-rise-3">
          Find out.
        </p>
      </div>

      <p className="absolute bottom-10 text-[0.7rem] font-semibold tracking-wide text-[#7d7465] wo-rise wo-rise-4">
        find your people
      </p>
    </div>
  );
}
