import { getCurrentUser, isBackendLive } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const live = isBackendLive();
  const me = await getCurrentUser();
  return <ProfileClient live={live} displayName={me?.name ?? "Nurain"} handle={me?.handle ?? "@Nurain_Dev"} />;
}
