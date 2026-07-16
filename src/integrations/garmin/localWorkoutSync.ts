import type { MtbWorkoutWeekBridgeExport } from "./mtbWorkoutBridge";

export interface LocalWorkoutSyncResult {
  ok: boolean;
  message: string;
  workoutsSynced?: number;
}

const localBridgeUrl = "http://127.0.0.1:8765";

export async function syncMtbWeekToLocalBridge(
  week: MtbWorkoutWeekBridgeExport,
): Promise<LocalWorkoutSyncResult> {
  const response = await fetch(`${localBridgeUrl}/sync/week`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(week),
  });

  const payload = (await response.json()) as Partial<LocalWorkoutSyncResult>;
  if (!response.ok) {
    return {
      ok: false,
      message: payload.message ?? "Local Garmin bridge sync failed.",
    };
  }

  return {
    ok: payload.ok ?? true,
    message: payload.message ?? "Workout week synced to Garmin.",
    workoutsSynced: payload.workoutsSynced,
  };
}
