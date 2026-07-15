import { describe, expect, it } from "vitest";
import { buildGarminReportMetrics, type GarminReportData } from "./garminReport";

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
          id: "run-1",
          date: "2026-07-14",
          name: "Run",
          type: "running",
          distanceMeters: 8000,
          durationSeconds: 2400,
          averageHeartRate: 148,
          trainingEffect: 3.1,
        },
        {
          id: "run-2",
          date: "2026-07-15",
          name: "Easy",
          type: "running",
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
});
