import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const browserClientCache = new Map<string, SupabaseClient>();

export function createSupabaseBrowserClient(url: string, anonKey: string): SupabaseClient {
  const cacheKey = `${url}:${anonKey}`;
  const cachedClient = browserClientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = createClient(url, anonKey);
  browserClientCache.set(cacheKey, client);
  return client;
}
