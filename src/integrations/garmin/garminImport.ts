import type { PlanData, ProgressMetric, TrendPoint } from "../../data/planData";

export interface GarminDailyImport {
  label: string;
  recoveryScore: number;
  sleepSeconds: number;
  hrvStatus: "low" | "balanced" | "high";
  hrvScore: number;
  hardWorkoutsLastFiveDays: number;
  weeklyLoad: number;
  vo2Max: number;
  restingHeartRate: number;
}

export const demoGarminDailyImport: GarminDailyImport = {
  label: "Garmin",
  recoveryScore: 76,
  sleepSeconds: 26_400,
  hrvStatus: "balanced",
  hrvScore: 72,
  hardWorkoutsLastFiveDays: 1,
  weeklyLoad: 486,
  vo2Max: 51.8,
  restingHeartRate: 51,
};

function sleepHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10;
}

function sleepScore(seconds: number): number {
  return Math.max(0, Math.min(100, Math.round((seconds / (10 * 3600)) * 100)));
}

function upsertMetric(
  metrics: ProgressMetric[],
  nextMetric: ProgressMetric,
): ProgressMetric[] {
  const withoutMetric = metrics.filter((metric) => metric.label !== nextMetric.label);
  return [...withoutMetric, nextMetric];
}

export function applyGarminDailyImport(
  planData: PlanData,
  dailyImport: GarminDailyImport,
): PlanData {
  const progressWithLoad = upsertMetric(planData.progressMetrics, {
    label: "Weekly load",
    value: String(dailyImport.weeklyLoad),
    change: "Imported from Garmin",
    tone: "steady",
  });
  const progressWithVo2 = upsertMetric(progressWithLoad, {
    label: "VO2 Max",
    value: dailyImport.vo2Max.toFixed(1),
    change: "Imported from Garmin",
    tone: "steady",
  });
  const progressMetrics = upsertMetric(progressWithVo2, {
    label: "Resting HR",
    value: `${dailyImport.restingHeartRate} bpm`,
    change: "Imported from Garmin",
    tone: "good",
  });

  const trendPoint: TrendPoint = {
    label: dailyImport.label,
    load: dailyImport.weeklyLoad,
    sleep: sleepScore(dailyImport.sleepSeconds),
    hrv: dailyImport.hrvScore,
  };

  return {
    ...planData,
    progressMetrics,
    trendData: [...planData.trendData.slice(-6), trendPoint],
    planInput: {
      ...planData.planInput,
      athlete: {
        ...planData.planInput.athlete,
        recoveryScore: dailyImport.recoveryScore,
        sleepHours: sleepHours(dailyImport.sleepSeconds),
        hrvStatus: dailyImport.hrvStatus,
        hardWorkoutsLastFiveDays: dailyImport.hardWorkoutsLastFiveDays,
      },
    },
  };
}
