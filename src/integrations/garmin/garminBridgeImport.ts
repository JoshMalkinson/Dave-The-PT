import type { GarminDailyImport } from "./garminImport";
import type { GarminReportData } from "./garminReport";

const hrvStatuses = ["low", "balanced", "high"] as const;

type HrvStatus = (typeof hrvStatuses)[number];

interface BridgeEnvelope {
  dailyImport?: unknown;
  reportData?: unknown;
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
  return parseGarminBridgeExportJson(jsonText).dailyImport;
}

export interface GarminBridgeExport {
  dailyImport: GarminDailyImport;
  reportData?: GarminReportData;
}

function toNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Garmin bridge field ${field} must be a number`);
  }

  return value;
}

function toString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Garmin bridge field ${field} must be a string`);
  }

  return value;
}

function toReportData(payload: unknown): GarminReportData | undefined {
  if (payload === undefined) {
    return undefined;
  }
  if (!isObject(payload)) {
    throw new Error("Garmin bridge reportData must be an object");
  }

  const days = Array.isArray(payload.days) ? payload.days : [];
  const activities = Array.isArray(payload.activities) ? payload.activities : [];

  return {
    windowDays: toNumber(payload.windowDays, "reportData.windowDays"),
    days: days.map((day, index) => {
      if (!isObject(day)) {
        throw new Error(`Garmin bridge reportData.days[${index}] must be an object`);
      }

      return {
        date: toString(day.date, `reportData.days[${index}].date`),
        sleepSeconds: toNumber(day.sleepSeconds, `reportData.days[${index}].sleepSeconds`),
        hrvScore: toNumber(day.hrvScore, `reportData.days[${index}].hrvScore`),
        restingHeartRate: toNumber(
          day.restingHeartRate,
          `reportData.days[${index}].restingHeartRate`,
        ),
        stressAverage: toNumber(day.stressAverage, `reportData.days[${index}].stressAverage`),
        bodyBatteryMin: toNumber(day.bodyBatteryMin, `reportData.days[${index}].bodyBatteryMin`),
        bodyBatteryMax: toNumber(day.bodyBatteryMax, `reportData.days[${index}].bodyBatteryMax`),
        steps: toNumber(day.steps, `reportData.days[${index}].steps`),
      };
    }),
    activities: activities.map((activity, index) => {
      if (!isObject(activity)) {
        throw new Error(`Garmin bridge reportData.activities[${index}] must be an object`);
      }

      return {
        id: toString(activity.id, `reportData.activities[${index}].id`),
        date: toString(activity.date, `reportData.activities[${index}].date`),
        name: toString(activity.name, `reportData.activities[${index}].name`),
        type: toString(activity.type, `reportData.activities[${index}].type`),
        distanceMeters: toNumber(
          activity.distanceMeters,
          `reportData.activities[${index}].distanceMeters`,
        ),
        durationSeconds: toNumber(
          activity.durationSeconds,
          `reportData.activities[${index}].durationSeconds`,
        ),
        averageHeartRate: toNumber(
          activity.averageHeartRate,
          `reportData.activities[${index}].averageHeartRate`,
        ),
        trainingEffect: toNumber(
          activity.trainingEffect,
          `reportData.activities[${index}].trainingEffect`,
        ),
      };
    }),
  };
}

export function parseGarminBridgeExportJson(jsonText: string): GarminBridgeExport {
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
  return {
    dailyImport: toDailyImport(envelope.dailyImport ?? parsed),
    reportData: toReportData(envelope.reportData),
  };
}
