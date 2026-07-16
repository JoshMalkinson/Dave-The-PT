import { CalendarDays, CloudLightning, Download, Send, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdaptiveWeek, DailyRecommendation } from "../domain/types";
import { syncMtbWeekToLocalBridge } from "../integrations/garmin/localWorkoutSync";
import {
  buildMtbWeekBridgeExport,
  buildMtbWorkoutBridgeExport,
  createMtbWorkoutDraft,
  estimateMtbWorkoutSeconds,
  templateIdForWorkout,
  type MtbWorkoutDraft,
} from "../integrations/garmin/mtbWorkoutBridge";

interface MtbWeeklyPlannerProps {
  week: AdaptiveWeek;
}

type DraftMap = Record<string, MtbWorkoutDraft | undefined>;

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function draftForDay(day: DailyRecommendation): MtbWorkoutDraft | undefined {
  const templateId = templateIdForWorkout(day.workout);
  if (!templateId) {
    return undefined;
  }

  return {
    ...createMtbWorkoutDraft(templateId, day.date),
    name: `Dave MTB ${day.workout.title}`,
    description: `${day.label}: ${day.reasons[0]}`,
  };
}

function buildDraftMap(week: AdaptiveWeek): DraftMap {
  return Object.fromEntries(week.days.map((day) => [day.date, draftForDay(day)]));
}

function fieldValue(value: number) {
  return Number.isFinite(value) ? String(value) : "0";
}

export function MtbWeeklyPlanner({ week }: MtbWeeklyPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(week.days[0]?.date ?? "");
  const [draftsByDate, setDraftsByDate] = useState<DraftMap>(() => buildDraftMap(week));
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const selectedDay = week.days.find((day) => day.date === selectedDate) ?? week.days[0];
  const selectedDraft = selectedDay ? draftsByDate[selectedDay.date] : undefined;
  const weekDrafts = useMemo(
    () =>
      week.days
        .map((day) => draftsByDate[day.date])
        .filter((draft): draft is MtbWorkoutDraft => Boolean(draft)),
    [draftsByDate, week.days],
  );

  function updateDraft(field: keyof MtbWorkoutDraft, value: string | number) {
    if (!selectedDay || !selectedDraft) {
      return;
    }

    setDraftsByDate((current) => ({
      ...current,
      [selectedDay.date]: {
        ...selectedDraft,
        [field]:
          typeof value === "number"
            ? Math.max(0, Math.round(value))
            : value,
      },
    }));
  }

  function downloadSelected() {
    if (!selectedDraft) {
      return;
    }
    downloadJson("garmin-mtb-workout.json", buildMtbWorkoutBridgeExport(selectedDraft));
  }

  function downloadWeek() {
    downloadJson("garmin-mtb-week.json", buildMtbWeekBridgeExport(weekDrafts));
  }

  async function syncWeek() {
    setIsSyncing(true);
    setSyncStatus("Syncing workout week...");
    try {
      const result = await syncMtbWeekToLocalBridge(buildMtbWeekBridgeExport(weekDrafts));
      setSyncStatus(result.message);
    } catch {
      setSyncStatus("Local Garmin bridge is not running on http://127.0.0.1:8765.");
    } finally {
      setIsSyncing(false);
    }
  }

  if (!selectedDay) {
    return null;
  }

  const selectedMinutes = selectedDraft
    ? Math.round(estimateMtbWorkoutSeconds(selectedDraft) / 60)
    : 0;

  return (
    <section className="mtb-weekly-planner" aria-label="MTB workout plan">
      <div className="planner-heading">
        <div>
          <p className="eyebrow">Watch Sync Plan</p>
          <h2>Mountain bike workouts</h2>
        </div>
        <div className="planner-actions">
          <button
            type="button"
            className="primary-action"
            onClick={syncWeek}
            disabled={weekDrafts.length === 0 || isSyncing}
          >
            <Send size={17} aria-hidden="true" />
            Sync week to Garmin
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={downloadWeek}
            disabled={weekDrafts.length === 0}
          >
            <Download size={17} aria-hidden="true" />
            Download week sync
          </button>
        </div>
      </div>

      <div className="workout-rail" role="tablist" aria-label="Weekly workouts">
        {week.days.map((day) => {
          const draft = draftsByDate[day.date];
          const isSelected = day.date === selectedDay.date;
          return (
            <button
              key={day.date}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={isSelected ? "workout-tab selected" : "workout-tab"}
              onClick={() => setSelectedDate(day.date)}
            >
              <span>{day.label}</span>
              <strong>{day.workout.title}</strong>
              <small>{draft ? `${day.workout.durationMinutes} min` : "No sync"}</small>
            </button>
          );
        })}
      </div>

      <div className="workout-detail">
        <div className="workout-summary">
          <div className="day-meta">
            <CalendarDays size={18} aria-hidden="true" />
            <span>
              {selectedDay.label} at {selectedDay.scheduledWindow}
            </span>
          </div>
          <h2>{selectedDay.workout.title}</h2>
          <p>{selectedDay.reasons[0]}</p>
          <div className="planner-stat-row">
            <span>
              <Timer size={16} aria-hidden="true" />
              {selectedDraft ? `${selectedMinutes} min` : "Rest"}
            </span>
            <span>
              <CloudLightning size={16} aria-hidden="true" />
              {selectedDay.weatherScore.level}
            </span>
          </div>
        </div>

        {selectedDraft ? (
          <div className="workout-editor">
            <label className="text-control">
              <span>Workout name</span>
              <input
                value={selectedDraft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </label>
            <label className="text-control">
              <span>Schedule date</span>
              <input
                type="date"
                value={selectedDraft.scheduleDate}
                onChange={(event) => updateDraft("scheduleDate", event.target.value)}
              />
            </label>
            <div className="planner-number-grid">
              <label className="text-control">
                <span>Warmup minutes</span>
                <input
                  type="number"
                  min="0"
                  value={fieldValue(selectedDraft.warmupMinutes)}
                  onChange={(event) =>
                    updateDraft("warmupMinutes", Number(event.target.value))
                  }
                />
              </label>
              <label className="text-control">
                <span>Work minutes</span>
                <input
                  type="number"
                  min="0"
                  value={fieldValue(selectedDraft.workMinutes)}
                  onChange={(event) => updateDraft("workMinutes", Number(event.target.value))}
                />
              </label>
              <label className="text-control">
                <span>Repeat count</span>
                <input
                  type="number"
                  min="1"
                  value={fieldValue(selectedDraft.repeats)}
                  onChange={(event) => updateDraft("repeats", Number(event.target.value))}
                />
              </label>
              <label className="text-control">
                <span>Recovery minutes</span>
                <input
                  type="number"
                  min="0"
                  value={fieldValue(selectedDraft.recoveryMinutes)}
                  onChange={(event) =>
                    updateDraft("recoveryMinutes", Number(event.target.value))
                  }
                />
              </label>
              <label className="text-control">
                <span>Cooldown minutes</span>
                <input
                  type="number"
                  min="0"
                  value={fieldValue(selectedDraft.cooldownMinutes)}
                  onChange={(event) =>
                    updateDraft("cooldownMinutes", Number(event.target.value))
                  }
                />
              </label>
            </div>
            <button type="button" className="secondary-action" onClick={downloadSelected}>
              <Download size={17} aria-hidden="true" />
              Download selected workout
            </button>
          </div>
        ) : (
          <div className="empty-sync-state">
            <p>No MTB workout is scheduled for watch sync on this day.</p>
          </div>
        )}
      </div>

      <p className="bridge-command">
        .\.venv-garmin\Scripts\python.exe tools\garmin_bridge_push_workout.py --input-week
        garmin-mtb-week.json --push
      </p>
      {syncStatus && <p className="sync-status-line">{syncStatus}</p>}
    </section>
  );
}
