import { useEffect, useState } from "react";
import { Moon, RotateCcw, Save, Settings2, Watch } from "lucide-react";
import type { PlanData } from "../data/planData";
import type { PlanRepositoryMode } from "../storage/planRepository";

interface SetupScreenProps {
  planData: PlanData;
  saveStatus: string;
  storageMode: PlanRepositoryMode;
  onReset: () => Promise<void>;
  onSave: (planData: PlanData) => Promise<void>;
}

export function SetupScreen({
  planData,
  saveStatus,
  storageMode,
  onReset,
  onSave,
}: SetupScreenProps) {
  const [draft, setDraft] = useState(planData);

  useEffect(() => {
    setDraft(planData);
  }, [planData]);

  const athlete = draft.planInput.athlete;
  const race = draft.planInput.race;
  const availability = draft.planInput.availability;

  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Athlete Setup</p>
        <h1>Setup</h1>
        <p>
          Tune the Garmin-style state and goal race, then save it to{" "}
          {storageMode === "supabase" ? "Supabase" : "local demo storage"}.
        </p>
      </section>

      <section className="settings-grid">
        <article className="content-panel">
          <div className="section-heading">
            <Watch size={20} aria-hidden="true" />
            <h2>Garmin State</h2>
          </div>
          <label className="control-row">
            <span>Recovery score</span>
            <strong>{athlete.recoveryScore}%</strong>
            <input
              type="range"
              min="20"
              max="100"
              value={athlete.recoveryScore}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  planInput: {
                    ...draft.planInput,
                    athlete: {
                      ...athlete,
                      recoveryScore: Number(event.target.value),
                    },
                  },
                })
              }
            />
          </label>
          <label className="control-row">
            <span>Sleep hours</span>
            <strong>{athlete.sleepHours.toFixed(1)}h</strong>
            <input
              type="range"
              min="4"
              max="10"
              step="0.1"
              value={athlete.sleepHours}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  planInput: {
                    ...draft.planInput,
                    athlete: {
                      ...athlete,
                      sleepHours: Number(event.target.value),
                    },
                  },
                })
              }
            />
          </label>
          <div className="segmented-control" aria-label="HRV status">
            {(["low", "balanced", "high"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={athlete.hrvStatus === status ? "selected" : ""}
                aria-pressed={athlete.hrvStatus === status}
                onClick={() =>
                  setDraft({
                    ...draft,
                    planInput: {
                      ...draft.planInput,
                      athlete: {
                        ...athlete,
                        hrvStatus: status,
                      },
                    },
                  })
                }
              >
                {status === "low" ? "Low HRV" : status}
              </button>
            ))}
          </div>
        </article>

        <article className="content-panel">
          <div className="section-heading">
            <Settings2 size={20} aria-hidden="true" />
            <h2>Goal Race</h2>
          </div>
          <label className="text-control">
            <span>Race name</span>
            <input
              aria-label="Race name"
              value={race.name}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  planInput: {
                    ...draft.planInput,
                    race: { ...race, name: event.target.value },
                  },
                })
              }
            />
          </label>
          <label className="text-control">
            <span>Race date</span>
            <input
              aria-label="Race date"
              type="date"
              value={race.date}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  planInput: {
                    ...draft.planInput,
                    race: { ...race, date: event.target.value },
                  },
                })
              }
            />
          </label>
          <dl className="detail-list compact">
            <div>
              <dt>Distance</dt>
              <dd>{race.distance}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{race.priority} race</dd>
            </div>
          </dl>
        </article>

        <article className="content-panel availability-panel">
          <div className="section-heading">
            <Moon size={20} aria-hidden="true" />
            <h2>Availability</h2>
          </div>
          <div className="availability-list">
            {Object.entries(availability).map(([day, windows]) => (
              <div key={day}>
                <span>{day.slice(0, 3)}</span>
                <strong>{windows.length ? windows.join(" / ") : "rest"}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="action-panel">
        <p>{saveStatus}</p>
        <div className="action-row">
          <button type="button" className="secondary-action" onClick={onReset}>
            <RotateCcw size={18} aria-hidden="true" />
            Reset demo
          </button>
          <button type="button" className="primary-action" onClick={() => onSave(draft)}>
            <Save size={18} aria-hidden="true" />
            Save setup
          </button>
        </div>
      </section>
    </div>
  );
}
