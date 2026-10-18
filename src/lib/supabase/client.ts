"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Browser-side Supabase client. Uses the public anon key — all access is
 * governed by Row-Level Security, so this is safe to ship to the browser.
 *
 * Returns null when env vars are missing, which is how the app falls back
 * to sample data in local demo mode. See src/lib/data/activities.ts.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient<Database>(url, key);
}
