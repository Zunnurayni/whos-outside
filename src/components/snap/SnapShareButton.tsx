"use client";

/**
 * Snapchat Creative Kit web-share. Deep-links back into the activity so a
 * friend who opens the Snap lands on the right listing. No Snap SDK needed for
 * the web share URL; Login Kit + Bitmoji come in Phase 5.
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
  const handleShare = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const appUrl = `${base}/activities/${activityId}`;
    const snapUrl = new URL("https://www.snapchat.com/share");
    snapUrl.searchParams.set("link", appUrl);
    snapUrl.searchParams.set("caption", `Who's outside for ${title} at ${venueName}? Need a few more! 👻`);
    window.open(snapUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full bg-[#FFFC00] px-5 py-2.5 font-semibold text-black shadow transition-transform active:scale-95"
    >
      👻 Share to Snapchat
    </button>
  );
}
