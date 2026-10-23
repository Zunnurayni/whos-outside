"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "signin" | "signup";

/**
 * Explicit Sign in / Sign up tabs so the intent is never ambiguous.
 * - Sign in: signInWithPassword. Wrong credentials → clear message + reset link.
 * - Sign up: signUp. Already registered → nudge to the Sign in tab.
 * - Forgot password: sends a reset email.
 * - Magic link: a no-password fallback.
 */
export function EmailLoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "working" | "sent-magic" | "sent-reset" | "confirm">("idle");
  const [error, setError] = useState("");

  const enter = () => {
    router.replace("/discover");
    router.refresh();
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setState("working");
    setError("");
    const creds = { email: email.trim(), password };

    if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword(creds);
      if (!error) return enter();
      setState("idle");
      // Supabase returns the same message for wrong password and no account.
      setError("Wrong email or password. New here? Switch to Sign up.");
      return;
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp(creds);
    if (error) {
      setState("idle");
      if (/already registered|already exists/i.test(error.message)) {
        setError("You already have an account. Switch to Sign in.");
      } else {
        setError(error.message);
      }
      return;
    }
    if (data.session) return enter(); // confirm-email OFF → instant session
    setState("confirm"); // confirm-email ON → check inbox
  }

  async function magicLink() {
    const supabase = createClient();
    if (!supabase || !email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setState("working");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState("idle");
      setError(error.message);
    } else {
      setState("sent-magic");
    }
  }

  async function resetPassword() {
    const supabase = createClient();
    if (!supabase || !email.trim()) {
      setError("Enter your email first, then tap reset.");
      return;
    }
    setState("working");
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setState("idle");
      setError(error.message);
    } else {
      setState("sent-reset");
    }
  }

  const input =
    "w-full rounded-[14px] border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-fg";

  // Post-action confirmation screens
  if (state === "sent-magic" || state === "sent-reset" || state === "confirm") {
    const copy =
      state === "sent-magic"
        ? `We sent a sign-in link to ${email}. Open it on this device.`
        : state === "sent-reset"
          ? `We sent a password-reset link to ${email}. Open it to set a new password.`
          : `Almost there. Confirm your email (${email}) to finish signing up.`;
    return (
      <div className="rounded-[14px] border border-line bg-surface p-5 text-center">
        <div className="text-3xl">📬</div>
        <h2 className="mt-2 text-lg font-bold">Check your email</h2>
        <p className="mt-1 text-[0.85rem] text-fg-soft">{copy}</p>
        <button
          onClick={() => {
            setState("idle");
            setError("");
          }}
          className="mt-3 text-[0.82rem] font-semibold text-violet underline"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] bg-surface-2 p-1">
        {(["signin", "signup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError("");
            }}
            className={`flex-1 rounded-[11px] py-2.5 text-[0.9rem] font-bold transition-colors ${
              tab === t ? "bg-surface text-fg shadow-sm" : "text-fg-soft"
            }`}
          >
            {t === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

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
          className={input}
        />
        <input
          id="login-password"
          type="password"
          required
          minLength={6}
          autoComplete={tab === "signin" ? "current-password" : "new-password"}
          placeholder={tab === "signin" ? "Your password" : "Create a password (min 6 chars)"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
        <button
          type="submit"
          disabled={state === "working"}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-5 py-3.5 font-bold text-accent-ink active:scale-[0.97] disabled:opacity-60"
        >
          {state === "working" ? "Working…" : tab === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {error && <p className="text-center text-[0.8rem] text-crit">{error}</p>}

      <div className="flex flex-col items-center gap-2 pt-1 text-[0.82rem] font-semibold text-fg-soft">
        {tab === "signin" && (
          <button type="button" onClick={resetPassword} className="underline">
            Forgot password?
          </button>
        )}
        <button type="button" onClick={magicLink} className="underline">
          Email me a magic link instead
        </button>
      </div>
    </div>
  );
}
