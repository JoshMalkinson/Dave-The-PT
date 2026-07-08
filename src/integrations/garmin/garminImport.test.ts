import { describe, expect, it } from "vitest";
import { demoPlanData } from "../../data/planData";
import { applyGarminDailyImport, demoGarminDailyImport } from "./garminImport";

describe("applyGarminDailyImport", () => {
  it("maps Garmin readiness signals into athlete state", () => {
    const nextPlanData = applyGarminDailyImport(demoPlanData, {
      ...demoGarminDailyImport,
      recoveryScore: 54,
      sleepSeconds: 19_800,
      hrvStatus: "low",
      hardWorkoutsLastFiveDays: 3,
    });

    expect(nextPlanData.planInput.athlete).toMatchObject({
      recoveryScore: 54,
      sleepHours: 5.5,
      hrvStatus: "low",
      hardWorkoutsLastFiveDays: 3,
    });
  });

  it("updates progress metrics from Garmin summary values", () => {
    const nextPlanData = applyGarminDailyImport(demoPlanData, {
      ...demoGarminDailyImport,
      weeklyLoad: 512,
      vo2Max: 52.4,
      restingHeartRate: 48,
    });

    expect(nextPlanData.progressMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Weekly load", value: "512" }),
        expect.objectContaining({ label: "VO2 Max", value: "52.4" }),
        expect.objectContaining({ label: "Resting HR", value: "48 bpm" }),
      ]),
    );
  });

  it("adds the imported day to the trend data", () => {
    const nextPlanData = applyGarminDailyImport(demoPlanData, {
      ...demoGarminDailyImport,
      label: "Today",
      weeklyLoad: 512,
      sleepSeconds: 27_000,
      hrvScore: 78,
    });

    expect(nextPlanData.trendData[nextPlanData.trendData.length - 1]).toEqual({
      label: "Today",
      load: 512,
      sleep: 75,
      hrv: 78,
    });
  });
});
