export type MtbWorkoutTemplateId =
  | "mtb-endurance-75"
  | "mtb-hill-repeats-60"
  | "mtb-tempo-90"
  | "mtb-recovery-45";

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

export const mtbWorkoutTemplates: MtbWorkoutTemplate[] = [
  {
    id: "mtb-endurance-75",
    label: "Endurance 75",
    draft: {
      templateId: "mtb-endurance-75",
      name: "Dave MTB Endurance 75",
      description: "Steady aerobic mountain bike endurance ride.",
      warmupMinutes: 10,
      workMinutes: 55,
      repeats: 1,
      recoveryMinutes: 0,
      cooldownMinutes: 10,
    },
  },
  {
    id: "mtb-hill-repeats-60",
    label: "Hill Repeats 60",
    draft: {
      templateId: "mtb-hill-repeats-60",
      name: "Dave MTB Hill Repeats 60",
      description: "Trail climb repeats with easy roll-down recoveries.",
      warmupMinutes: 12,
      workMinutes: 4,
      repeats: 5,
      recoveryMinutes: 3,
      cooldownMinutes: 13,
    },
  },
  {
    id: "mtb-tempo-90",
    label: "Tempo Trail 90",
    draft: {
      templateId: "mtb-tempo-90",
      name: "Dave MTB Tempo Trail 90",
      description: "Progressive tempo-focused mountain bike ride.",
      warmupMinutes: 15,
      workMinutes: 60,
      repeats: 1,
      recoveryMinutes: 0,
      cooldownMinutes: 15,
    },
  },
  {
    id: "mtb-recovery-45",
    label: "Recovery Spin 45",
    draft: {
      templateId: "mtb-recovery-45",
      name: "Dave MTB Recovery Spin 45",
      description: "Easy recovery spin, keep pressure low.",
      warmupMinutes: 5,
      workMinutes: 35,
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

export function buildMtbWorkoutBridgeExport(draft: MtbWorkoutDraft) {
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
    schemaVersion: 1,
    source: "dave-the-pt",
    workoutType: "mountain_bike",
    scheduleDate: draft.scheduleDate,
    garminWorkoutPayload: {
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
    },
  };
}
