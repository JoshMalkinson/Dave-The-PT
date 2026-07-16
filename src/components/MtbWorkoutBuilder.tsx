import { Download, Mountain, TimerReset } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildMtbWorkoutBridgeExport,
  createMtbWorkoutDraft,
  estimateMtbWorkoutSeconds,
  mtbWorkoutTemplates,
  type MtbWorkoutDraft,
  type MtbWorkoutTemplateId,
} from "../integrations/garmin/mtbWorkoutBridge";

function nextDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function minutesLabel(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function downloadJson(fileName: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function MtbWorkoutBuilder() {
  const [draft, setDraft] = useState<MtbWorkoutDraft>(() =>
    createMtbWorkoutDraft("mtb-climb-repeats-50", nextDate()),
  );
  const bridgeExport = useMemo(() => buildMtbWorkoutBridgeExport(draft), [draft]);
  const durationSeconds = estimateMtbWorkoutSeconds(draft);

  function selectTemplate(templateId: MtbWorkoutTemplateId) {
    setDraft(createMtbWorkoutDraft(templateId, draft.scheduleDate));
  }

  function updateNumber(field: keyof MtbWorkoutDraft, value: string) {
    setDraft({
      ...draft,
      [field]: Math.max(0, Number(value)),
    });
  }

  return (
    <section className="content-panel mtb-builder">
      <div className="section-heading">
        <Mountain size={20} aria-hidden="true" />
        <h2>Garmin MTB Workout</h2>
      </div>

      <div className="builder-grid">
        <label className="text-control">
          <span>Template</span>
          <select
            aria-label="MTB workout template"
            value={draft.templateId}
            onChange={(event) => selectTemplate(event.target.value as MtbWorkoutTemplateId)}
          >
            {mtbWorkoutTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-control">
          <span>Schedule date</span>
          <input
            aria-label="MTB workout date"
            type="date"
            value={draft.scheduleDate}
            onChange={(event) => setDraft({ ...draft, scheduleDate: event.target.value })}
          />
        </label>
        <label className="text-control wide-control">
          <span>Name</span>
          <input
            aria-label="MTB workout name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>
      </div>

      <div className="builder-grid numeric-builder-grid">
        <label className="text-control">
          <span>Warmup</span>
          <input
            aria-label="Warmup minutes"
            type="number"
            min="0"
            value={draft.warmupMinutes}
            onChange={(event) => updateNumber("warmupMinutes", event.target.value)}
          />
        </label>
        <label className="text-control">
          <span>Work</span>
          <input
            aria-label="Work minutes"
            type="number"
            min="1"
            value={draft.workMinutes}
            onChange={(event) => updateNumber("workMinutes", event.target.value)}
          />
        </label>
        <label className="text-control">
          <span>Repeats</span>
          <input
            aria-label="Repeat count"
            type="number"
            min="1"
            value={draft.repeats}
            onChange={(event) => updateNumber("repeats", event.target.value)}
          />
        </label>
        <label className="text-control">
          <span>Recovery</span>
          <input
            aria-label="Recovery minutes"
            type="number"
            min="0"
            value={draft.recoveryMinutes}
            onChange={(event) => updateNumber("recoveryMinutes", event.target.value)}
          />
        </label>
        <label className="text-control">
          <span>Cooldown</span>
          <input
            aria-label="Cooldown minutes"
            type="number"
            min="0"
            value={draft.cooldownMinutes}
            onChange={(event) => updateNumber("cooldownMinutes", event.target.value)}
          />
        </label>
      </div>

      <div className="builder-summary">
        <div>
          <TimerReset size={18} aria-hidden="true" />
          <strong>{minutesLabel(durationSeconds)}</strong>
          <span>cycling workout payload for Garmin MTB bridge</span>
        </div>
        <button
          type="button"
          className="primary-action"
          onClick={() => downloadJson("garmin-mtb-workout.json", bridgeExport)}
        >
          <Download size={18} aria-hidden="true" />
          Download bridge workout
        </button>
      </div>

      <code className="command-preview">
        .\.venv-garmin\Scripts\python.exe tools\garmin_bridge_push_workout.py
        --input garmin-mtb-workout.json --push
      </code>
    </section>
  );
}
