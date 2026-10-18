"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Client fallback for magic links whose token lands in the URL hash fragment
// (#access_token=...&refresh_token=...) or as ?token_hash=&type=. The server
// can't read a hash fragment, so this runs in the browser, establishes the
// session, then sends the user into the app.
export default function ConfirmPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      if (!supabase) {
        router.replace("/discover");
        return;
      }

      // 1. Hash-fragment tokens (#access_token / #refresh_token)
      const hash = window.location.hash.startsWith("#")
        ? new URLSearchParams(window.location.hash.slice(1))
        : null;
      const access_token = hash?.get("access_token");
      const refresh_token = hash?.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) {
          router.replace("/discover");
          return;
        }
      }

      // 2. ?token_hash=&type= in the query string
      const qs = new URLSearchParams(window.location.search);
      const token_hash = qs.get("token_hash");
      const type = qs.get("type");
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        if (!error) {
          router.replace("/discover");
          return;
        }
      }

      // 3. Maybe a session already exists (SDK auto-detected it)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/discover");
        return;
      }

      setMsg("That sign-in link didn't work. Please request a new one.");
      setTimeout(() => router.replace("/login?error=auth"), 2500);
    };
    run();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <div className="text-4xl">👻</div>
      <p className="text-fg-soft">{msg}</p>
    </main>
  );
}
