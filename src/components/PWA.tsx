"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Logo } from "@/components/Logo";

// Registers the service worker and shows a tasteful "Add to Home Screen"
// prompt when the browser offers one. Dismissal is remembered so it doesn't
// nag. iOS has no beforeinstallprompt, so there we show a one-time hint.
export function PWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem("wo-install-dismissed") === "1";
    } catch {}
    if (dismissed) return;

    // already installed?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari: no beforeinstallprompt. Offer the manual hint once.
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (isIos && isSafari) {
      const t = setTimeout(() => setIosHint(true), 3500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    setIosHint(false);
    try {
      localStorage.setItem("wo-install-dismissed", "1");
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    setShow(false);
    try {
      localStorage.setItem("wo-install-dismissed", "1");
    } catch {}
  };

  if (!show && !iosHint) return null;

  return (
    <div
      className="fixed inset-x-0 z-[90] mx-auto max-w-app px-4"
      style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card">
        <Logo size={40} rounded={11} className="block shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.9rem] font-bold text-fg">Add Who&apos;s Outside?</p>
          <p className="text-[0.76rem] text-fg-soft">
            {iosHint
              ? "Tap Share, then Add to Home Screen."
              : "Install it for one-tap access, like a real app."}
          </p>
        </div>
        {show && !iosHint && (
          <button
            onClick={install}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[0.82rem] font-bold text-accent-ink active:scale-95"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-faint active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
