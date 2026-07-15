import { describe, expect, it } from "vitest";
import {
  parseGarminBridgeExportJson,
  parseGarminBridgeImportJson,
} from "./garminBridgeImport";

const validDailyImport = {
  label: "2026-07-15",
  recoveryScore: 81,
  sleepSeconds: 27_000,
  hrvStatus: "balanced",
  hrvScore: 76,
  hardWorkoutsLastFiveDays: 1,
  weeklyLoad: 502,
  vo2Max: 52.1,
  restingHeartRate: 49,
};

describe("parseGarminBridgeImportJson", () => {
  it("parses a local Garmin bridge envelope", () => {
    const parsed = parseGarminBridgeImportJson(
      JSON.stringify({
        schemaVersion: 1,
        source: "python-garminconnect",
        exportedAt: "2026-07-15T10:00:00Z",
        dailyImport: validDailyImport,
      }),
    );

    expect(parsed).toEqual(validDailyImport);
  });

  it("parses richer reporting data from a bridge envelope", () => {
    const parsed = parseGarminBridgeExportJson(
      JSON.stringify({
        schemaVersion: 2,
        source: "python-garminconnect",
        dailyImport: validDailyImport,
        reportData: {
          windowDays: 14,
          days: [
            {
              date: "2026-07-15",
              sleepSeconds: 27_000,
              hrvScore: 76,
              restingHeartRate: 49,
              stressAverage: 33,
              bodyBatteryMin: 22,
              bodyBatteryMax: 88,
              steps: 10_250,
            },
          ],
          activities: [
            {
              id: "123",
              date: "2026-07-14",
              name: "Morning Run",
              type: "running",
              distanceMeters: 8200,
              durationSeconds: 2700,
              averageHeartRate: 148,
              trainingEffect: 3.2,
            },
          ],
        },
      }),
    );

    expect(parsed.reportData?.windowDays).toBe(14);
    expect(parsed.reportData?.days[0].steps).toBe(10_250);
    expect(parsed.reportData?.activities[0].distanceMeters).toBe(8200);
  });

  it("parses a raw GarminDailyImport payload", () => {
    expect(parseGarminBridgeImportJson(JSON.stringify(validDailyImport))).toEqual(
      validDailyImport,
    );
  });

  it("rejects invalid JSON", () => {
    expect(() => parseGarminBridgeImportJson("{nope")).toThrow("Invalid Garmin bridge JSON");
  });

  it("rejects invalid HRV status values", () => {
    expect(() =>
      parseGarminBridgeImportJson(
        JSON.stringify({
          ...validDailyImport,
          hrvStatus: "excellent",
        }),
      ),
    ).toThrow("Garmin bridge field hrvStatus must be low, balanced, or high");
  });

  it("rejects missing numeric fields", () => {
    expect(() =>
      parseGarminBridgeImportJson(
        JSON.stringify({
          ...validDailyImport,
          weeklyLoad: undefined,
        }),
      ),
    ).toThrow("Garmin bridge field weeklyLoad must be a number");
  });
});
