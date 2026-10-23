import Link from "next/link";
import { isBackendLive } from "@/lib/auth";
import { Logo } from "@/components/Logo";
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
        <div className="wo-rise wo-rise-1">
          <div className="wo-float wo-glow inline-block rounded-2xl">
            <Logo size={64} rounded={16} className="block" />
          </div>
        </div>
        <h1 className="mt-8 text-[2.4rem] font-extrabold leading-[1.05] wo-rise wo-rise-2">
          <span className="wo-sheen-text">Who&apos;s outside?</span>
        </h1>
        <p className="mt-2 text-[1.5rem] font-bold text-accent wo-rise wo-rise-3">
          Find out.
        </p>
        <p className="mt-4 max-w-[30ch] text-[1.02rem] text-fg-soft wo-rise wo-rise-4">
          See what&apos;s on in Yola, find your crew, and show up.
        </p>
      </div>

      <div className="flex flex-col gap-3 wo-rise wo-rise-4">
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
