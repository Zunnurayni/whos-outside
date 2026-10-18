"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign-in with two methods:
 *  - Email + password (default): instant, no email sent, no rate limit.
 *    New emails are signed up on the fly; the handle_new_user trigger makes
 *    the profile row. Best for development.
 *  - Magic link (secondary): emails a one-time link. Subject to the built-in
 *    sender's hourly rate limit on the free plan.
 */
export function EmailLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "working" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function passwordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setState("working");
    setMessage("");

    // Try sign-in first; if the account doesn't exist, sign up.
    const signIn = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signIn.error) {
      router.replace("/discover");
      router.refresh();
      return;
    }

    // Account may not exist yet — create it.
    const signUp = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUp.error) {
      setState("error");
      setMessage(signUp.error.message);
      return;
    }

    // If email confirmation is OFF, we get a session immediately.
    if (signUp.data.session) {
      router.replace("/discover");
      router.refresh();
      return;
    }

    // Email confirmation is ON — tell them to confirm, or they can switch it
    // off in Supabase (Auth → Providers → Email → Confirm email) for dev.
    setState("sent");
    setMessage(email.trim());
  }

  async function magicSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setState("working");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
      setMessage(email.trim());
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-5 text-center">
        <div className="text-3xl">📬</div>
        <h2 className="mt-2 text-lg font-bold">Check your email</h2>
        <p className="mt-1 text-[0.85rem] text-fg-soft">
          {mode === "magic"
            ? `We sent a sign-in link to ${message}. Open it on this device.`
            : `Confirm your email (${message}) to finish. Or turn off "Confirm email" in Supabase for instant dev sign-in.`}
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-3 text-[0.82rem] font-semibold text-violet underline"
        >
          Back
        </button>
      </div>
    );
  }

  const input =
    "w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-fg";

  return (
    <form onSubmit={mode === "password" ? passwordSubmit : magicSubmit} className="flex flex-col gap-3">
      <input
        id="login-email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={input}
      />
      {mode === "password" && (
        <input
          id="login-password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      )}
      <button
        type="submit"
        disabled={state === "working"}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-5 py-3.5 font-bold text-accent-ink active:scale-[0.97] disabled:opacity-60"
      >
        {state === "working"
          ? "Working…"
          : mode === "password"
            ? "Sign in / Sign up"
            : "Send me a sign-in link"}
      </button>
      {state === "error" && <p className="text-center text-[0.8rem] text-crit">{message}</p>}
      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "magic" : "password");
          setState("idle");
          setMessage("");
        }}
        className="text-center text-[0.82rem] font-semibold text-fg-soft underline"
      >
        {mode === "password" ? "Use a magic link instead" : "Use email + password instead"}
      </button>
    </form>
  );
}
