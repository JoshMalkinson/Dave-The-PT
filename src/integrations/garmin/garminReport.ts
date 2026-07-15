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

export interface GarminInsight {
  title: string;
  detail: string;
  tone: "good" | "steady" | "watch";
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

export function buildGarminInsights(report: GarminReportData): GarminInsight[] {
  const recentDays = report.days.slice(-7);
  const recentActivities = report.activities.slice(0, 14);
  const averageSleepSeconds = average(recentDays.map((day) => day.sleepSeconds));
  const averageHrv = average(recentDays.map((day) => day.hrvScore));
  const averageStress = average(recentDays.map((day) => day.stressAverage));
  const averageBodyBatteryMax = average(recentDays.map((day) => day.bodyBatteryMax));
  const activeDays = new Set(recentActivities.map((activity) => activity.date)).size;
  const totalDurationHours =
    recentActivities.reduce((sum, activity) => sum + activity.durationSeconds, 0) / 3600;

  const insights: GarminInsight[] = [];

  if (averageStress >= 55 || (averageHrv > 0 && averageHrv < 50) || averageBodyBatteryMax < 60) {
    insights.push({
      title: "Recovery pressure is elevated",
      detail: `Recent stress averages ${Math.round(averageStress)} with HRV near ${Math.round(
        averageHrv,
      )}. Bias today toward easy aerobic work or recovery.`,
      tone: "watch",
    });
  } else {
    insights.push({
      title: "Recovery signals are stable",
      detail: `Stress, HRV, and body battery look steady across the recent Garmin window.`,
      tone: "good",
    });
  }

  if (averageSleepSeconds > 0 && averageSleepSeconds < 7 * 3600) {
    insights.push({
      title: "Sleep is below target",
      detail: `Average sleep is ${formatHours(
        averageSleepSeconds,
      )}. Keep intensity conservative until sleep trends closer to 7 hours.`,
      tone: "watch",
    });
  } else {
    insights.push({
      title: "Sleep supports training",
      detail: `Average sleep is ${formatHours(averageSleepSeconds)} across the Garmin window.`,
      tone: "good",
    });
  }

  if (activeDays < 3 || totalDurationHours < 3) {
    insights.push({
      title: "Training consistency is light",
      detail: `${activeDays} active days and ${totalDurationHours.toFixed(
        1,
      )} hours logged recently. Build volume before chasing intensity.`,
      tone: "steady",
    });
  } else {
    insights.push({
      title: "Training rhythm is building",
      detail: `${activeDays} active days and ${totalDurationHours.toFixed(
        1,
      )} hours logged recently. Maintain the rhythm with controlled progression.`,
      tone: "good",
    });
  }

  return insights;
}
