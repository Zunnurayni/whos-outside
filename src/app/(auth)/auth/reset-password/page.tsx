"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Set-a-new-password screen. The recovery email link lands here (via
 * /auth/callback, which establishes a short-lived recovery session first).
 * The user types a new password; updateUser saves it, then we send them in.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState("");

  // Confirm a recovery session exists; the link should have created one.
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      if (!supabase) {
        setError("Backend not configured.");
        setReady(true);
        return;
      }
      // The SDK may still be exchanging the token from the URL hash; also
      // listen for the PASSWORD_RECOVERY event.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setReady(true);
      supabase.auth.onAuthStateChange((event, s) => {
        if (event === "PASSWORD_RECOVERY" || s) setReady(true);
      });
      // Fallback: show the form anyway after a moment so the user isn't stuck.
      setTimeout(() => setReady(true), 1500);
    };
    check();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setState("working");
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState("idle");
      setError(error.message);
      return;
    }
    setState("done");
    setTimeout(() => {
      router.replace("/discover");
      router.refresh();
    }, 1200);
  }

  const input =
    "w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-fg";

  return (
    <main
      className="mx-auto flex min-h-screen max-w-app flex-col justify-center bg-bg px-6 text-fg"
      style={{
        paddingLeft: "max(24px, env(safe-area-inset-left,0px))",
        paddingRight: "max(24px, env(safe-area-inset-right,0px))",
      }}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-4xl text-accent-ink shadow-card">
        👻
      </div>
      <h1 className="mt-6 text-[1.8rem] leading-tight">Set a new password</h1>
      <p className="mt-2 text-[0.95rem] text-fg-soft">Choose a password you&apos;ll remember.</p>

      {state === "done" ? (
        <div className="mt-6 rounded-[14px] border border-line bg-surface p-5 text-center">
          <div className="text-3xl">✅</div>
          <p className="mt-2 font-bold">Password updated</p>
          <p className="mt-1 text-[0.85rem] text-fg-soft">Signing you in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            disabled={!ready}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={input}
            disabled={!ready}
          />
          <button
            type="submit"
            disabled={state === "working" || !ready}
            className="flex w-full items-center justify-center rounded-[14px] bg-accent px-5 py-3.5 font-bold text-accent-ink active:scale-[0.97] disabled:opacity-60"
          >
            {!ready ? "Loading…" : state === "working" ? "Saving…" : "Save new password"}
          </button>
          {error && <p className="text-center text-[0.8rem] text-crit">{error}</p>}
        </form>
      )}
    </main>
  );
}
