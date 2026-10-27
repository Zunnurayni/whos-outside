// Snap Login Kit (OAuth 2.0) configuration. Everything here reads from env so
// the flow stays dormant until you register the app at devportal.snap.com and
// set the client id. Nothing here needs a secret on the client.
//
// To go live, set in Vercel:
//   NEXT_PUBLIC_SNAP_CLIENT_ID   (public — the OAuth client id)
//   SNAP_CLIENT_SECRET           (server only — for the token exchange)
//   NEXT_PUBLIC_APP_URL          (your live origin, for the redirect URI)

export const SNAP_CLIENT_ID = process.env.NEXT_PUBLIC_SNAP_CLIENT_ID ?? "";

// Snap only grants identity we ask for. We request the minimum: external id,
// display name, and Bitmoji avatar. No friends, no Snap Map, no Stories.
export const SNAP_SCOPES = [
  "https://auth.snapchat.com/oauth2/api/user.display_name",
  "https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar",
  "https://auth.snapchat.com/oauth2/api/user.external_id",
];

export const SNAP_AUTHORIZE_URL = "https://accounts.snapchat.com/accounts/oauth2/auth";
export const SNAP_TOKEN_URL = "https://accounts.snapchat.com/accounts/oauth2/token";
export const SNAP_ME_URL = "https://kit.snapchat.com/v1/me";

export function snapEnabled(): boolean {
  return SNAP_CLIENT_ID.length > 0;
}

export function snapRedirectUri(origin: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  return `${base}/auth/snap/callback`;
}

// Build the URL that starts the Snap login flow.
export function snapAuthorizeUrl(origin: string, state: string): string {
  const url = new URL(SNAP_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", SNAP_CLIENT_ID);
  url.searchParams.set("redirect_uri", snapRedirectUri(origin));
  url.searchParams.set("scope", SNAP_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}
