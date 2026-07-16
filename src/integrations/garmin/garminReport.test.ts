import { describe, expect, it } from "vitest";
import {
  buildGarminInsights,
  buildGarminReportMetrics,
  type GarminReportData,
} from "./garminReport";

describe("buildGarminReportMetrics", () => {
  it("summarizes Garmin bridge report data into progress metrics", () => {
    const report: GarminReportData = {
      windowDays: 14,
      days: [
        {
          date: "2026-07-14",
          sleepSeconds: 25_200,
          hrvScore: 64,
          restingHeartRate: 52,
          stressAverage: 36,
          bodyBatteryMin: 20,
          bodyBatteryMax: 82,
          steps: 8000,
        },
        {
          date: "2026-07-15",
          sleepSeconds: 28_800,
          hrvScore: 70,
          restingHeartRate: 50,
          stressAverage: 42,
          bodyBatteryMin: 24,
          bodyBatteryMax: 88,
          steps: 10_000,
        },
      ],
      activities: [
        {
          id: "ride-1",
          date: "2026-07-14",
          name: "Trail Ride",
          type: "cycling",
          distanceMeters: 8000,
          durationSeconds: 2400,
          averageHeartRate: 148,
          trainingEffect: 3.1,
        },
        {
          id: "ride-2",
          date: "2026-07-15",
          name: "Easy Spin",
          type: "cycling",
          distanceMeters: 5000,
          durationSeconds: 1800,
          averageHeartRate: 132,
          trainingEffect: 2.1,
        },
      ],
    };

    expect(buildGarminReportMetrics(report)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Garmin distance", value: "13.0 km" }),
        expect.objectContaining({ label: "Training time", value: "1.2h" }),
        expect.objectContaining({ label: "Avg sleep", value: "7.5h" }),
        expect.objectContaining({ label: "Avg HRV", value: "67" }),
      ]),
    );
  });

  it("builds coaching insights from recent Garmin report data", () => {
    const report: GarminReportData = {
      windowDays: 14,
      days: [
        {
          date: "2026-07-13",
          sleepSeconds: 21_600,
          hrvScore: 42,
          restingHeartRate: 58,
          stressAverage: 62,
          bodyBatteryMin: 18,
          bodyBatteryMax: 52,
          steps: 6000,
        },
        {
          date: "2026-07-14",
          sleepSeconds: 23_400,
          hrvScore: 45,
          restingHeartRate: 57,
          stressAverage: 65,
          bodyBatteryMin: 20,
          bodyBatteryMax: 55,
          steps: 7200,
        },
        {
          date: "2026-07-15",
          sleepSeconds: 25_200,
          hrvScore: 48,
          restingHeartRate: 56,
          stressAverage: 60,
          bodyBatteryMin: 24,
          bodyBatteryMax: 58,
          steps: 8200,
        },
      ],
      activities: [
        {
          id: "a-1",
          date: "2026-07-13",
          name: "Cardio",
          type: "indoor_cardio",
          distanceMeters: 0,
          durationSeconds: 3600,
          averageHeartRate: 150,
          trainingEffect: 3.1,
        },
      ],
    };

    expect(buildGarminInsights(report)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Recovery pressure is elevated",
          tone: "watch",
        }),
        expect.objectContaining({
          title: "Sleep is below target",
          tone: "watch",
        }),
        expect.objectContaining({
          title: "Training consistency is light",
          tone: "steady",
        }),
      ]),
    );
  });
});
