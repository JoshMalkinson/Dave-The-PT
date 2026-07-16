import { describe, expect, it } from "vitest";
import {
  buildMtbWeekBridgeExport,
  buildMtbWorkoutBridgeExport,
  createMtbWorkoutDraft,
  estimateMtbWorkoutSeconds,
  templateIdForWorkout,
} from "./mtbWorkoutBridge";

describe("MTB workout bridge", () => {
  it("builds an adjustable hill repeat workout payload", () => {
    const draft = {
      ...createMtbWorkoutDraft("mtb-climb-repeats-50", "2026-07-17"),
      repeats: 6,
    };

    const bridge = buildMtbWorkoutBridgeExport(draft);

    expect(estimateMtbWorkoutSeconds(draft)).toBe(3420);
    expect(bridge).toMatchObject({
      schemaVersion: 1,
        workoutType: "mountain_bike",
        scheduleDate: "2026-07-17",
        garminWorkoutPayload: {
        workoutName: "Dave MTB Climb Repeats 50",
        sportType: {
          sportTypeKey: "cycling",
        },
      },
    });
    expect(
      bridge.garminWorkoutPayload.workoutSegments[0].workoutSteps[1],
    ).toMatchObject({
      type: "RepeatGroupDTO",
      numberOfIterations: 6,
    });
  });

  it("maps adaptive workouts to MTB templates", () => {
    expect(
      templateIdForWorkout({ durationMinutes: 60, intensity: "hard", type: "intervals" }),
    ).toBe("mtb-climb-repeats-50");
    expect(
      templateIdForWorkout({ durationMinutes: 90, intensity: "moderate", type: "long" }),
    ).toBe("mtb-aerobic-45");
    expect(
      templateIdForWorkout({ durationMinutes: 0, intensity: "rest", type: "rest" }),
    ).toBeNull();
  });

  it("builds a weekly bridge export for scheduled MTB workouts", () => {
    const week = buildMtbWeekBridgeExport([
      createMtbWorkoutDraft("mtb-recovery-40", "2026-07-17"),
      createMtbWorkoutDraft("mtb-climb-repeats-50", "2026-07-18"),
    ]);

    expect(week.workoutType).toBe("mountain_bike_week");
    expect(week.workouts).toHaveLength(2);
    expect(week.workouts[1].scheduleDate).toBe("2026-07-18");
  });
});
