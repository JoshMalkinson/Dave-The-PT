import { LocalPlanRepository } from "./localPlanRepository";
import type { PlanRepository } from "./planRepository";
import { createSupabaseBrowserClient } from "./supabaseClient";
import { SupabasePlanRepository } from "./supabasePlanRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

interface RepositoryEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export function createPlanRepository(
  env: RepositoryEnv,
  storage: Storage = window.localStorage,
  supabaseClient?: SupabaseClient,
): PlanRepository {
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    return new SupabasePlanRepository(
      supabaseClient ??
        createSupabaseBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY),
    );
  }

  return new LocalPlanRepository(storage);
}
