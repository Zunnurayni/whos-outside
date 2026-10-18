import Link from "next/link";
import { isBackendLive } from "@/lib/auth";
import { EmailLoginForm } from "./EmailLoginForm";

// Server component. In demo mode (no Supabase) it shows the browse-first entry
// screen. In live mode it shows a working email magic-link form. Phase 5 adds
// the Snap Login Kit button.
export default function LoginPage() {
  const live = isBackendLive();
  return (
    <main
      className="mx-auto flex min-h-screen max-w-app flex-col justify-between bg-bg px-6 pb-10 pt-16 text-fg"
      style={{ paddingLeft: "max(24px, env(safe-area-inset-left,0px))", paddingRight: "max(24px, env(safe-area-inset-right,0px))" }}
    >
      <div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-4xl text-accent-ink shadow-card">
          👻
        </div>
        <h1 className="mt-8 text-[2.2rem] leading-tight">
          Who&apos;s
          <br />
          Outside?
        </h1>
        <p className="mt-3 max-w-[28ch] text-[1.05rem] text-fg-soft">
          Find your people. Experience more of life.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {live ? (
          <EmailLoginForm />
        ) : (
          <>
            <Link
              href="/discover"
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-5 py-3.5 font-bold text-accent-ink active:scale-[0.97]"
            >
              👻 Continue with Snapchat
            </Link>
            <Link
              href="/discover"
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-surface px-5 py-3.5 font-bold text-fg active:scale-[0.97]"
            >
              Continue with email
            </Link>
          </>
        )}
        <Link href="/discover" className="py-2 text-center text-[0.85rem] font-semibold text-fg-soft">
          Browse first, no account needed →
        </Link>
        <p className="mt-2 text-center text-[0.72rem] text-fg-faint">
          By continuing you agree to our community guidelines. You must be 18+.
          <br />
          Connecting Snapchat never shares your friends, chats, or Snap Map location.
        </p>
      </div>
    </main>
  );
}
