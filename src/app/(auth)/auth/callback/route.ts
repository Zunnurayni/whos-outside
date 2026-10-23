import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after the user clicks the magic link. Magic links
// arrive in one of two server-readable shapes depending on the project's email
// template:
//   1. ?code=...                         → exchangeCodeForSession (PKCE)
//   2. ?token_hash=...&type=magiclink    → verifyOtp (the default template)
// A third shape puts the token in the URL #hash, which the server can't read —
// that case is handled by the client fallback at /auth/confirm.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const type = searchParams.get("type") as EmailOtpType | null;
  // A password-recovery link must land on the set-new-password screen, not in
  // the app. Everything else goes to ?next (default /discover).
  const next = searchParams.get("next") ?? (type === "recovery" ? "/auth/reset-password" : "/discover");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");

  const supabase = createClient();

  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  if (supabase && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // No server-readable token — hand off to the client page, which can read a
  // token carried in the URL hash fragment. Carry the type so recovery links
  // still reach the reset screen.
  const confirmNext = type === "recovery" ? "/auth/reset-password" : next;
  return NextResponse.redirect(`${origin}/auth/confirm?next=${encodeURIComponent(confirmNext)}`);
}
