import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  SNAP_CLIENT_ID,
  SNAP_TOKEN_URL,
  SNAP_ME_URL,
  SNAP_SCOPES,
  snapRedirectUri,
  snapEnabled,
} from "@/lib/snap/config";

// Snap Login Kit callback. Validates state, exchanges the code for a token,
// pulls the approved identity (external id, display name, Bitmoji), and links
// it to the signed-in user's profile.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const back = (status: string) => NextResponse.redirect(`${origin}/profile?snap=${status}`);

  if (!snapEnabled()) return back("unavailable");

  // CSRF check
  const expected = cookies().get("snap_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) return back("error");

  const secret = process.env.SNAP_CLIENT_SECRET;
  if (!secret) return back("error");

  try {
    // 1. Exchange the code for an access token.
    const tokenRes = await fetch(SNAP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: snapRedirectUri(origin),
        client_id: SNAP_CLIENT_ID,
        client_secret: secret,
      }),
    });
    if (!tokenRes.ok) return back("error");
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return back("error");

    // 2. Fetch the approved identity fields.
    const query = `{ me { externalId displayName bitmoji { avatar } } }`;
    const meRes = await fetch(SNAP_ME_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { scopes: SNAP_SCOPES } }),
    });
    if (!meRes.ok) return back("error");
    const payload = (await meRes.json()) as {
      data?: { me?: { externalId?: string; displayName?: string; bitmoji?: { avatar?: string } } };
    };
    const me = payload.data?.me;
    if (!me?.externalId) return back("error");

    // 3. Link to the signed-in user's profile.
    const supabase = createClient();
    if (!supabase) return back("demo");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return back("signin");

    const { error } = await supabase
      .from("profiles")
      .update({
        snapchat_id: me.externalId,
        bitmoji_avatar_url: me.bitmoji?.avatar ?? null,
        // only overwrite the display name if the user hasn't set one
      })
      .eq("id", user.id);
    if (error) return back("error");

    return back("linked");
  } catch {
    return back("error");
  }
}
