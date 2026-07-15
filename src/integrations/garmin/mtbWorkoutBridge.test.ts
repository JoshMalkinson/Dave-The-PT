import { describe, expect, it } from "vitest";
import {
  buildMtbWorkoutBridgeExport,
  createMtbWorkoutDraft,
  estimateMtbWorkoutSeconds,
} from "./mtbWorkoutBridge";

describe("MTB workout bridge", () => {
  it("builds an adjustable hill repeat workout payload", () => {
    const draft = {
      ...createMtbWorkoutDraft("mtb-hill-repeats-60", "2026-07-17"),
      repeats: 6,
    };

    const bridge = buildMtbWorkoutBridgeExport(draft);

    expect(estimateMtbWorkoutSeconds(draft)).toBe(4020);
    expect(bridge).toMatchObject({
      schemaVersion: 1,
      workoutType: "mountain_bike",
      scheduleDate: "2026-07-17",
      garminWorkoutPayload: {
        workoutName: "Dave MTB Hill Repeats 60",
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
});
