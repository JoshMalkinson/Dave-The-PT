export type MtbWorkoutTemplateId =
  | "mtb-aerobic-45"
  | "mtb-climb-repeats-50"
  | "mtb-tempo-55"
  | "mtb-recovery-40";

export interface MtbWorkoutDraft {
  templateId: MtbWorkoutTemplateId;
  name: string;
  description: string;
  scheduleDate: string;
  warmupMinutes: number;
  workMinutes: number;
  repeats: number;
  recoveryMinutes: number;
  cooldownMinutes: number;
}

export interface MtbWorkoutTemplate {
  id: MtbWorkoutTemplateId;
  label: string;
  draft: Omit<MtbWorkoutDraft, "scheduleDate">;
}

export interface MtbWorkoutBridgeExport {
  schemaVersion: number;
  source: "dave-the-pt";
  workoutType: "mountain_bike";
  scheduleDate: string;
  garminWorkoutPayload: ReturnType<typeof buildGarminWorkoutPayload>;
}

export interface MtbWorkoutWeekBridgeExport {
  schemaVersion: number;
  source: "dave-the-pt";
  workoutType: "mountain_bike_week";
  workouts: MtbWorkoutBridgeExport[];
}

export const mtbWorkoutTemplates: MtbWorkoutTemplate[] = [
  {
    id: "mtb-aerobic-45",
    label: "Aerobic Spin 45",
    draft: {
      templateId: "mtb-aerobic-45",
      name: "Dave MTB Aerobic Spin 45",
      description: "Steady zone 2 aerobic mountain bike ride.",
      warmupMinutes: 10,
      workMinutes: 30,
      repeats: 1,
      recoveryMinutes: 0,
      cooldownMinutes: 5,
    },
  },
  {
    id: "mtb-climb-repeats-50",
    label: "Climb Repeats 50",
    draft: {
      templateId: "mtb-climb-repeats-50",
      name: "Dave MTB Climb Repeats 50",
      description: "Threshold-focused trail climb repeats with easy roll-down recoveries.",
      warmupMinutes: 10,
      workMinutes: 4,
      repeats: 5,
      recoveryMinutes: 3,
      cooldownMinutes: 5,
    },
  },
  {
    id: "mtb-tempo-55",
    label: "Tempo Trail 55",
    draft: {
      templateId: "mtb-tempo-55",
      name: "Dave MTB Tempo Trail 55",
      description: "Sweet-spot tempo mountain bike ride for sustained trail pressure.",
      warmupMinutes: 10,
      workMinutes: 13,
      repeats: 2,
      recoveryMinutes: 5,
      cooldownMinutes: 9,
    },
  },
  {
    id: "mtb-recovery-40",
    label: "Recovery Spin 40",
    draft: {
      templateId: "mtb-recovery-40",
      name: "Dave MTB Recovery Spin 40",
      description: "Easy recovery spin, keep pressure low.",
      warmupMinutes: 5,
      workMinutes: 30,
      repeats: 1,
      recoveryMinutes: 0,
      cooldownMinutes: 5,
    },
  },
];

export function createMtbWorkoutDraft(
  templateId: MtbWorkoutTemplateId,
  scheduleDate: string,
): MtbWorkoutDraft {
  const template = mtbWorkoutTemplates.find((candidate) => candidate.id === templateId);
  if (!template) {
    throw new Error(`Unknown MTB workout template: ${templateId}`);
  }

  return {
    ...template.draft,
    scheduleDate,
  };
}

export function estimateMtbWorkoutSeconds(draft: MtbWorkoutDraft): number {
  const repeatBlockMinutes =
    draft.repeats * (draft.workMinutes + Math.max(0, draft.recoveryMinutes));
  return Math.round(
    (draft.warmupMinutes + repeatBlockMinutes + draft.cooldownMinutes) * 60,
  );
}

export function templateIdForWorkout(input: {
  durationMinutes: number;
  intensity: string;
  type: string;
}): MtbWorkoutTemplateId | null {
  if (input.durationMinutes <= 0 || input.type === "rest") {
    return null;
  }
  if (input.intensity === "hard" || input.type === "intervals" || input.type === "hills") {
    return "mtb-climb-repeats-50";
  }
  if (input.type === "long") {
    return "mtb-aerobic-45";
  }
  if (input.intensity === "moderate" || input.type === "tempo" || input.type === "threshold") {
    return "mtb-tempo-55";
  }
  if (input.type === "easy" || input.intensity === "easy") {
    return "mtb-aerobic-45";
  }
  return "mtb-recovery-40";
}

function targetType() {
  return {
    workoutTargetTypeId: 1,
    workoutTargetTypeKey: "no.target",
    displayOrder: 1,
  };
}

function timeCondition() {
  return {
    conditionTypeId: 2,
    conditionTypeKey: "time",
    displayOrder: 2,
    displayable: true,
  };
}

function executableStep(stepOrder: number, stepTypeId: number, stepTypeKey: string, minutes: number) {
  return {
    type: "ExecutableStepDTO",
    stepOrder,
    stepType: {
      stepTypeId,
      stepTypeKey,
      displayOrder: stepTypeId,
    },
    endCondition: timeCondition(),
    endConditionValue: minutes * 60,
    targetType: targetType(),
  };
}

function buildGarminWorkoutPayload(draft: MtbWorkoutDraft) {
  const workStep = executableStep(1, 3, "interval", draft.workMinutes);
  const recoveryStep =
    draft.recoveryMinutes > 0
      ? executableStep(2, 4, "recovery", draft.recoveryMinutes)
      : undefined;
  const workoutSteps = [
    executableStep(1, 1, "warmup", draft.warmupMinutes),
    draft.repeats > 1
      ? {
          type: "RepeatGroupDTO",
          stepOrder: 2,
          stepType: {
            stepTypeId: 6,
            stepTypeKey: "repeat",
            displayOrder: 6,
          },
          numberOfIterations: draft.repeats,
          workoutSteps: recoveryStep ? [workStep, recoveryStep] : [workStep],
          endCondition: {
            conditionTypeId: 7,
            conditionTypeKey: "iterations",
            displayOrder: 7,
            displayable: false,
          },
          endConditionValue: draft.repeats,
          smartRepeat: false,
        }
      : executableStep(2, 3, "interval", draft.workMinutes),
    executableStep(3, 2, "cooldown", draft.cooldownMinutes),
  ];

  return {
      workoutName: draft.name,
      sportType: {
        sportTypeId: 2,
        sportTypeKey: "cycling",
        displayOrder: 2,
      },
      estimatedDurationInSecs: estimateMtbWorkoutSeconds(draft),
      workoutSegments: [
        {
          segmentOrder: 1,
          sportType: {
            sportTypeId: 2,
            sportTypeKey: "cycling",
            displayOrder: 2,
          },
          workoutSteps,
        },
      ],
      author: {},
      description: draft.description,
  };
}

export function buildMtbWorkoutBridgeExport(draft: MtbWorkoutDraft): MtbWorkoutBridgeExport {
  return {
    schemaVersion: 1,
    source: "dave-the-pt",
    workoutType: "mountain_bike",
    scheduleDate: draft.scheduleDate,
    garminWorkoutPayload: buildGarminWorkoutPayload(draft),
  };
}

export function buildMtbWeekBridgeExport(
  drafts: MtbWorkoutDraft[],
): MtbWorkoutWeekBridgeExport {
  return {
    schemaVersion: 1,
    source: "dave-the-pt",
    workoutType: "mountain_bike_week",
    workouts: drafts.map(buildMtbWorkoutBridgeExport),
  };
}
