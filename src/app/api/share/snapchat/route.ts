import { NextResponse } from "next/server";

/**
 * Returns Snapchat Creative Kit web-share metadata for an activity.
 * Phase 5 expands this to generate a dynamic OpenGraph image / sticker and
 * sign the deep link. For now it builds the share URL on the server so the
 * client never needs app secrets.
 *
 * GET /api/share/snapchat?activityId=...&title=...&venue=...
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activityId = searchParams.get("activityId");
  const title = searchParams.get("title") ?? "this outing";
  const venue = searchParams.get("venue") ?? "a spot nearby";

  if (!activityId) {
    return NextResponse.json({ error: "activityId is required" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const appUrl = `${base}/activities/${activityId}`;

  const share = new URL("https://www.snapchat.com/share");
  share.searchParams.set("link", appUrl);
  share.searchParams.set("caption", `Who's outside for ${title} at ${venue}? Need a few more! 👻`);

  return NextResponse.json({ shareUrl: share.toString(), deepLink: appUrl });
}
