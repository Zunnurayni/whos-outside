/**
 * Database types for the Who's Outside? schema.
 *
 * This is a hand-written starter that matches supabase/migrations/0001_init.sql.
 * Once your project is live, regenerate the authoritative version with:
 *   npm run db:types
 * (requires the Supabase CLI linked to your project).
 */

export type ActivityStatus = "draft" | "open" | "filled" | "completed" | "cancelled";
export type ActivityVisibility = "public" | "unlisted" | "invite_only";
export type ParticipationStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "confirmed_on_way"
  | "attended"
  | "flaked";
export type EventStatus = "pending_review" | "published" | "rejected" | "cancelled";

export interface Profile {
  id: string;
  snapchat_id: string | null;
  display_name: string;
  handle: string | null;
  bio: string | null;
  bitmoji_avatar_url: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  location: unknown; // PostGIS geography — read via RPC, not directly
  created_at: string;
}

export interface Activity {
  id: string;
  creator_id: string;
  venue_id: string | null;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string | null;
  estimated_cost_per_person: number;
  min_participants: number;
  max_participants: number;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  created_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  status: ParticipationStatus;
  created_at: string;
}

export interface EventRow {
  id: string;
  submitted_by: string | null;
  venue_id: string | null;
  title: string;
  organiser_name: string;
  description: string | null;
  category: string;
  starts_at: string;
  ticket_url: string | null;
  source: string;
  status: EventStatus;
  created_at: string;
}

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Row<Profile>; Insert: Insert<Profile>; Update: Update<Profile> };
      venues: { Row: Row<Venue>; Insert: Insert<Venue>; Update: Update<Venue> };
      activities: { Row: Row<Activity>; Insert: Insert<Activity>; Update: Update<Activity> };
      activity_participants: {
        Row: Row<ActivityParticipant>;
        Insert: Insert<ActivityParticipant>;
        Update: Update<ActivityParticipant>;
      };
      events: { Row: Row<EventRow>; Insert: Insert<EventRow>; Update: Update<EventRow> };
      user_interests: {
        Row: { id: string; user_id: string; category: string };
        Insert: { user_id: string; category: string };
        Update: { category?: string };
      };
      reviews: {
        Row: {
          id: string;
          activity_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: { activity_id: string; reviewer_id: string; rating: number; comment?: string };
        Update: { rating?: number; comment?: string };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          reported_user_id: string | null;
          activity_id: string | null;
          reason: string;
          details: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          reported_user_id?: string;
          activity_id?: string;
          reason: string;
          details?: string;
        };
        Update: { resolved?: boolean };
      };
    };
    Functions: {
      get_nearby_activities: {
        Args: { user_lat: number; user_lng: number; radius_meters?: number };
        Returns: {
          activity_id: string;
          title: string;
          category: string;
          starts_at: string;
          venue_name: string;
          distance_meters: number;
        }[];
      };
    };
  };
}
