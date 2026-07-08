import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey);
}
