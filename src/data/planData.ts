import { demoPlanInput, progressMetrics, trendData } from "./seedData";
import type { ProgressMetric, TrendPoint } from "./seedData";
import type { TrainingPlanInput } from "../domain/types";

export type { ProgressMetric, TrendPoint } from "./seedData";

export interface PlanData {
  location: TrainingLocation;
  planInput: TrainingPlanInput;
  progressMetrics: ProgressMetric[];
  trendData: TrendPoint[];
}

export interface TrainingLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const demoPlanData: PlanData = {
  location: {
    name: "Johannesburg",
    latitude: -26.2041,
    longitude: 28.0473,
    timezone: "Africa/Johannesburg",
  },
  planInput: demoPlanInput,
  progressMetrics,
  trendData,
};
