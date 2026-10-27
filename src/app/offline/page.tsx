import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Offline — Who's Outside?" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col items-center justify-center gap-5 bg-bg px-8 text-center text-fg">
      <Logo size={72} rounded={20} className="block opacity-90" />
      <div>
        <h1 className="font-display text-[1.6rem] font-extrabold leading-tight">
          You&apos;re offline
        </h1>
        <p className="mt-2 max-w-[30ch] text-[0.95rem] text-fg-soft">
          Who&apos;s outside? You&apos;ll find out the moment you&apos;re back online.
        </p>
      </div>
      <Link
        href="/discover"
        className="rounded-[14px] bg-accent px-6 py-3 font-bold text-accent-ink active:scale-[0.97]"
      >
        Try again
      </Link>
    </main>
  );
}
