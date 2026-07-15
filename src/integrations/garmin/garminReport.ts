import type { ProgressMetric } from "../../data/planData";

export interface GarminReportDay {
  date: string;
  sleepSeconds: number;
  hrvScore: number;
  restingHeartRate: number;
  stressAverage: number;
  bodyBatteryMin: number;
  bodyBatteryMax: number;
  steps: number;
}

export interface GarminReportActivity {
  id: string;
  date: string;
  name: string;
  type: string;
  distanceMeters: number;
  durationSeconds: number;
  averageHeartRate: number;
  trainingEffect: number;
}

export interface GarminReportData {
  windowDays: number;
  days: GarminReportDay[];
  activities: GarminReportActivity[];
}

function average(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  if (filtered.length === 0) {
    return 0;
  }

  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return `${hours.toFixed(1)}h`;
}

export function buildGarminReportMetrics(report: GarminReportData): ProgressMetric[] {
  const totalDistanceKm =
    report.activities.reduce((sum, activity) => sum + activity.distanceMeters, 0) / 1000;
  const totalDurationHours =
    report.activities.reduce((sum, activity) => sum + activity.durationSeconds, 0) / 3600;
  const hardSessions = report.activities.filter((activity) => activity.trainingEffect >= 3).length;
  const averageSleepSeconds = average(report.days.map((day) => day.sleepSeconds));
  const averageHrv = average(report.days.map((day) => day.hrvScore));
  const averageRestingHr = average(report.days.map((day) => day.restingHeartRate));
  const averageStress = average(report.days.map((day) => day.stressAverage));

  return [
    {
      label: "Garmin distance",
      value: `${totalDistanceKm.toFixed(1)} km`,
      change: `${report.activities.length} activities in ${report.windowDays} days`,
      tone: totalDistanceKm > 0 ? "good" : "watch",
    },
    {
      label: "Training time",
      value: `${totalDurationHours.toFixed(1)}h`,
      change: `${hardSessions} hard sessions`,
      tone: hardSessions > 2 ? "watch" : "steady",
    },
    {
      label: "Avg sleep",
      value: formatHours(averageSleepSeconds),
      change: "Garmin bridge window",
      tone: averageSleepSeconds >= 7 * 3600 ? "good" : "watch",
    },
    {
      label: "Avg HRV",
      value: String(Math.round(averageHrv)),
      change: "Garmin bridge window",
      tone: averageHrv >= 60 ? "good" : "steady",
    },
    {
      label: "Avg resting HR",
      value: `${Math.round(averageRestingHr)} bpm`,
      change: "Garmin bridge window",
      tone: "steady",
    },
    {
      label: "Avg stress",
      value: String(Math.round(averageStress)),
      change: "Garmin bridge window",
      tone: averageStress > 55 ? "watch" : "steady",
    },
  ];
}
