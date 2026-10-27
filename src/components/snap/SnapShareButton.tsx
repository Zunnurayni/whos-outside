"use client";

import { Share2 } from "lucide-react";

/**
 * Share a plan. Uses the native share sheet when the device has one (so the
 * user can send straight to Snapchat, WhatsApp, iMessage, etc. with the rich
 * link preview), and falls back to Snapchat's Creative Kit web-share URL.
 * Login Kit + Bitmoji are handled elsewhere; this is distribution only.
 */
export function SnapShareButton({
  activityId,
  title,
  venueName,
}: {
  activityId: string;
  title: string;
  venueName: string;
}) {
  const share = async () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const url = `${base}/activities/${activityId}`;
    const text = `Who's outside for ${title} at ${venueName}? Need a few more. 👻`;

    // Native share sheet (mobile): best experience, keeps the link preview.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Who's Outside?", text, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to Snapchat link
      }
    }

    // Snapchat Creative Kit web-share fallback (desktop).
    const snap = new URL("https://www.snapchat.com/share");
    snap.searchParams.set("link", url);
    snap.searchParams.set("caption", text);
    window.open(snap.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 rounded-full bg-[#FFFC00] px-5 py-2.5 font-semibold text-black shadow transition-transform active:scale-95"
    >
      <Share2 className="h-4 w-4 stroke-[2.5]" />
      Share this plan
    </button>
  );
}
