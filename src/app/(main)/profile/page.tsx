import { getCurrentUser, isBackendLive } from "@/lib/auth";
import { getMyInterests } from "@/lib/data/profiles";
import { snapEnabled } from "@/lib/snap/config";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const live = isBackendLive();
  const [me, interests] = await Promise.all([getCurrentUser(), getMyInterests()]);
  return (
    <ProfileClient
      live={live}
      displayName={me?.name ?? "Nurain"}
      handle={me?.handle ?? "@Nurain_Dev"}
      initialInterests={interests}
      snapLinked={Boolean(me?.bitmojiUrl)}
      snapEnabled={snapEnabled()}
    />
  );
}
