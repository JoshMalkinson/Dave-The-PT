import { demoPlanData, type PlanData } from "../data/planData";
import type { PlanRepository } from "./planRepository";

const defaultStorageKey = "adaptive-coach.plan-data.v1";

export class LocalPlanRepository implements PlanRepository {
  mode = "local" as const;

  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly storageKey = defaultStorageKey,
  ) {}

  async load(): Promise<PlanData> {
    const stored = this.storage.getItem(this.storageKey);
    if (!stored) {
      return demoPlanData;
    }

    try {
      return JSON.parse(stored) as PlanData;
    } catch {
      return demoPlanData;
    }
  }

  async save(planData: PlanData): Promise<void> {
    this.storage.setItem(this.storageKey, JSON.stringify(planData));
  }

  async reset(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}
