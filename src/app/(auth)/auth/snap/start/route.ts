import { NextResponse } from "next/server";
import { snapAuthorizeUrl, snapEnabled } from "@/lib/snap/config";

// Kicks off Snap Login Kit. Redirects the user to Snapchat to approve, with a
// CSRF state cookie. Snap sends them back to /auth/snap/callback.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!snapEnabled()) {
    return NextResponse.redirect(`${origin}/profile?snap=unavailable`);
  }

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(snapAuthorizeUrl(origin, state));
  res.cookies.set("snap_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
