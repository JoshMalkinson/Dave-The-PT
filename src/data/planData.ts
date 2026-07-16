import { demoPlanInput, progressMetrics, trendData } from "./seedData";
import type { ProgressMetric, TrendPoint } from "./seedData";
import type { TrainingPlanInput } from "../domain/types";
import type { GarminReportData } from "../integrations/garmin/garminReport";

export type { ProgressMetric, TrendPoint } from "./seedData";

export interface PlanData {
  location: TrainingLocation;
  planInput: TrainingPlanInput;
  progressMetrics: ProgressMetric[];
  trendData: TrendPoint[];
  garminReport?: GarminReportData;
}

export interface TrainingLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const demoPlanData: PlanData = {
  location: {
    name: "Port Elizabeth / Gqeberha",
    latitude: -33.9608,
    longitude: 25.6022,
    timezone: "Africa/Johannesburg",
  },
  planInput: demoPlanInput,
  progressMetrics,
  trendData,
};
