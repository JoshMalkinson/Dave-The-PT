import { describe, expect, it } from "vitest";
import { parseGarminBridgeImportJson } from "./garminBridgeImport";

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
