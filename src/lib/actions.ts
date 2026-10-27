"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for every write. Each one checks auth, respects RLS (the
 * database is the real gatekeeper), and revalidates the affected pages.
 *
 * In demo mode (no Supabase) these return a soft result so the UI can show a
 * toast without persisting — the client components handle that path too.
 */

export interface ActionResult {
  ok: boolean;
  message: string;
  id?: string;
}

function noBackend(): ActionResult {
  return { ok: false, message: "demo" };
}

// ── Auth ───────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}

// ── Create an activity ───────────────────────────────────────────────────
export async function createActivity(input: {
  title: string;
  description: string;
  category: string;
  venueName: string;
  startsAt: string; // ISO
  cost: number;
  maxParticipants: number;
  minParticipants: number;
  joinRule: string;
  /** real coordinates from venue search; falls back to Yola centre */
  lat?: number | null;
  lng?: number | null;
}): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in to post a plan." };

  // Upsert the venue (public place) so the activity can link to it.
  let venueId: string | null = null;
  if (input.venueName.trim()) {
    // Use geocoded coordinates when the venue search provided them; otherwise
    // Yola centre so the pin still lands in the right city.
    const lng = input.lng ?? 12.4954;
    const lat = input.lat ?? 9.2035;
    const { data: venue } = await supabase
      .from("venues")
      .insert({
        name: input.venueName.trim(),
        category: input.category,
        address: input.venueName.trim(),
        city: "Yola",
        location: `POINT(${lng} ${lat})`,
      })
      .select("id")
      .single();
    venueId = venue?.id ?? null;
  }

  const visibility = input.joinRule === "invite" ? "invite_only" : "public";

  const { data, error } = await supabase
    .from("activities")
    .insert({
      creator_id: user.id,
      venue_id: venueId,
      title: input.title.trim(),
      description: input.description.trim() || "Join me for this one.",
      category: input.category,
      starts_at: input.startsAt,
      estimated_cost_per_person: input.cost,
      min_participants: input.minParticipants,
      max_participants: input.maxParticipants,
      visibility,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  // Creator joins their own plan as accepted.
  if (data?.id) {
    await supabase
      .from("activity_participants")
      .insert({ activity_id: data.id, user_id: user.id, status: "accepted" });
  }

  revalidatePath("/discover");
  revalidatePath("/map");
  return { ok: true, message: "Plan posted — it's live on the map 👻", id: data?.id };
}

// ── Request to join ───────────────────────────────────────────────────────
export async function requestToJoin(activityId: string): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in to join." };

  const { error } = await supabase
    .from("activity_participants")
    .insert({ activity_id: activityId, user_id: user.id, status: "requested" });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/crews");
  return { ok: true, message: "Request sent 🎉" };
}

// ── Leave a plan ──────────────────────────────────────────────────────────
export async function leaveActivity(activityId: string): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in." };

  const { error } = await supabase
    .from("activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/crews");
  return { ok: true, message: "You left this plan 👋" };
}

// ── Approve / decline a join request (organiser only) ──────────────────────
export async function respondToRequest(
  participantUserId: string,
  activityId: string,
  decision: "accepted" | "declined"
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const { error } = await supabase
    .from("activity_participants")
    .update({ status: decision })
    .eq("activity_id", activityId)
    .eq("user_id", participantUserId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/crews");
  revalidatePath(`/activities/${activityId}`);
  return {
    ok: true,
    message: decision === "accepted" ? "Added to the crew ✅" : "Request declined",
  };
}

// ── Confirm "on my way" at check-in ────────────────────────────────────────
export async function confirmOnWay(activityId: string): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in." };

  const { error } = await supabase
    .from("activity_participants")
    .update({ status: "confirmed_on_way" })
    .eq("activity_id", activityId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/crews");
  return { ok: true, message: "You're confirmed — meeting pin unlocked 📍" };
}

// ── Interests ─────────────────────────────────────────────────────────────
export async function saveInterests(categories: string[]): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in." };

  // Replace the user's interest set with the chosen categories.
  await supabase.from("user_interests").delete().eq("user_id", user.id);
  if (categories.length) {
    const rows = categories.map((category) => ({ user_id: user.id, category }));
    const { error } = await supabase.from("user_interests").insert(rows);
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/discover");
  return { ok: true, message: "Interests saved ✨" };
}

// ── Notifications ──────────────────────────────────────────────────────────
export async function markNotificationsRead(): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return noBackend();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in." };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/notifications");
  return { ok: true, message: "" };
}
