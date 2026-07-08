import { demoPlanInput, progressMetrics, trendData } from "./seedData";
import type { ProgressMetric, TrendPoint } from "./seedData";
import type { TrainingPlanInput } from "../domain/types";

export interface PlanData {
  planInput: TrainingPlanInput;
  progressMetrics: ProgressMetric[];
  trendData: TrendPoint[];
}

export const demoPlanData: PlanData = {
  planInput: demoPlanInput,
  progressMetrics,
  trendData,
};
