import type { PlanData } from "../data/planData";

export type PlanRepositoryMode = "local" | "supabase";

export interface PlanRepository {
  mode: PlanRepositoryMode;
  load(): Promise<PlanData>;
  save(planData: PlanData): Promise<void>;
  reset(): Promise<void>;
}
