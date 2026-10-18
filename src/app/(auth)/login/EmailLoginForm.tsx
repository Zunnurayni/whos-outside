"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Email magic-link sign-in. Supabase sends a one-time link; clicking it hits
// /auth/callback, which exchanges the code for a session and redirects in.
export function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-5 text-center">
        <div className="text-3xl">📬</div>
        <h2 className="mt-2 text-lg font-bold">Check your email</h2>
        <p className="mt-1 text-[0.85rem] text-fg-soft">
          We sent a sign-in link to {email}. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        id="login-email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-fg"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-5 py-3.5 font-bold text-accent-ink active:scale-[0.97] disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send me a sign-in link"}
      </button>
      {state === "error" && <p className="text-center text-[0.8rem] text-crit">{message}</p>}
    </form>
  );
}
