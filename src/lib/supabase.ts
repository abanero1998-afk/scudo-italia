import { createClient, type SupabaseClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = url.startsWith("https://") && !url.includes("REPLACE") && anon.length > 20;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(url, anon);
}
export type HailReport = {
  id: string; created_at: string; lat: number; lng: number; size: string; intensity: string;
  note?: string | null; photo_url?: string | null; user_name: string; city?: string | null; province?: string | null; verified?: boolean; source?: string;
};
