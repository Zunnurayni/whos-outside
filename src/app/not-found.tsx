import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <div className="text-6xl">🫥</div>
      <h1 className="text-2xl">Nobody&apos;s here</h1>
      <p className="max-w-[30ch] text-fg-soft">This plan may have ended or the link is wrong.</p>
      <Link
        href="/discover"
        className="rounded-[14px] bg-accent px-5 py-3 font-bold text-accent-ink active:scale-95"
      >
        Back to Discover
      </Link>
    </main>
  );
}
