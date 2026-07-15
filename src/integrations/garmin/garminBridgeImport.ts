import type { GarminDailyImport } from "./garminImport";

const hrvStatuses = ["low", "balanced", "high"] as const;

type HrvStatus = (typeof hrvStatuses)[number];

interface BridgeEnvelope {
  dailyImport?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(payload: Record<string, unknown>, field: keyof GarminDailyImport): number {
  const value = payload[field];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Garmin bridge field ${field} must be a number`);
  }

  return value;
}

function readString(payload: Record<string, unknown>, field: keyof GarminDailyImport): string {
  const value = payload[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Garmin bridge field ${field} must be a string`);
  }

  return value;
}

function readHrvStatus(payload: Record<string, unknown>): HrvStatus {
  const value = payload.hrvStatus;
  if (!hrvStatuses.includes(value as HrvStatus)) {
    throw new Error("Garmin bridge field hrvStatus must be low, balanced, or high");
  }

  return value as HrvStatus;
}

function toDailyImport(payload: unknown): GarminDailyImport {
  if (!isObject(payload)) {
    throw new Error("Garmin bridge payload must be an object");
  }

  return {
    label: readString(payload, "label"),
    recoveryScore: readNumber(payload, "recoveryScore"),
    sleepSeconds: readNumber(payload, "sleepSeconds"),
    hrvStatus: readHrvStatus(payload),
    hrvScore: readNumber(payload, "hrvScore"),
    hardWorkoutsLastFiveDays: readNumber(payload, "hardWorkoutsLastFiveDays"),
    weeklyLoad: readNumber(payload, "weeklyLoad"),
    vo2Max: readNumber(payload, "vo2Max"),
    restingHeartRate: readNumber(payload, "restingHeartRate"),
  };
}

export function parseGarminBridgeImportJson(jsonText: string): GarminDailyImport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid Garmin bridge JSON");
  }

  if (!isObject(parsed)) {
    throw new Error("Garmin bridge JSON must be an object");
  }

  const envelope = parsed as BridgeEnvelope;
  return toDailyImport(envelope.dailyImport ?? parsed);
}
