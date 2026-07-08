import { describe, expect, it } from "vitest";
import { mapPlanDataToSupabaseRows, mapSupabaseRowsToPlanData } from "./supabasePlanRepository";
import { demoPlanData } from "../data/planData";

describe("Supabase plan row mapping", () => {
  it("maps plan data to normalized Supabase rows", () => {
    const rows = mapPlanDataToSupabaseRows(demoPlanData, "user-123");

    expect(rows.athleteSettings.user_id).toBe("user-123");
    expect(rows.raceGoal.name).toBe(demoPlanData.planInput.race.name);
    expect(rows.availabilityWindows).toContainEqual({
      user_id: "user-123",
      day_label: "Tuesday",
      training_window: "evening",
    });
    expect(rows.plannedWorkouts[0]).toMatchObject({
      user_id: "user-123",
      external_id: demoPlanData.planInput.workouts[0].id,
    });
    expect(rows.weatherSnapshots).toHaveLength(7);
  });

  it("maps Supabase rows back to plan data", () => {
    const rows = mapPlanDataToSupabaseRows(demoPlanData, "user-123");

    const planData = mapSupabaseRowsToPlanData(rows);

    expect(planData).toEqual(demoPlanData);
  });
});
