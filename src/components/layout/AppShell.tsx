import type { ReactNode } from "react";
import { TabBar } from "./TabBar";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * The phone-shaped app shell: centred column, bottom tab bar, and the
 * safe-area band painter. Wraps every (main) route.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* top safe-area band so nothing scrolls under the system bar */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] bg-surface"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      <div className="relative mx-auto min-h-screen max-w-app bg-bg">
        <div className="pb-[92px]">{children}</div>
        <TabBar />
      </div>
    </ToastProvider>
  );
}

/** horizontal page gutter used inside screens */
export function Pad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        paddingLeft: "max(18px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(18px, env(safe-area-inset-right, 0px))",
      }}
    >
      {children}
    </div>
  );
}
