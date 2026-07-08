import { LocalPlanRepository } from "./localPlanRepository";
import type { PlanRepository } from "./planRepository";
import { SupabasePlanRepository } from "./supabasePlanRepository";

interface RepositoryEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export function createPlanRepository(
  env: RepositoryEnv,
  storage: Storage = window.localStorage,
): PlanRepository {
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    return new SupabasePlanRepository(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  }

  return new LocalPlanRepository(storage);
}
