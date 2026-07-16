import { useEffect, useState } from "react";
import { CloudSun, FileUp, Moon, RotateCcw, Save, Settings2, Watch } from "lucide-react";
import type { AuthSessionState } from "../auth/supabaseAuthClient";
import type { PlanData } from "../data/planData";
import type { PlanRepositoryMode } from "../storage/planRepository";
import { AuthPanel } from "./AuthPanel";

interface SetupScreenProps {
  authSession: AuthSessionState | null;
  planData: PlanData;
  saveStatus: string;
  storageMode: PlanRepositoryMode;
  onReset: () => Promise<void>;
  onImportGarminBridgeFile: (file: File) => Promise<void>;
  onRefreshLiveWeather: (planData: PlanData) => Promise<void>;
  onSave: (planData: PlanData) => Promise<void>;
  onSendMagicLink: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function SetupScreen({
  authSession,
  planData,
  saveStatus,
  storageMode,
  onImportGarminBridgeFile,
  onReset,
  onRefreshLiveWeather,
  onSave,
  onSendMagicLink,
  onSignOut,
}: SetupScreenProps) {
  const [draft, setDraft] = useState(planData);

  useEffect(() => {
    setDraft(planData);
  }, [planData]);

  const athlete = draft.planInput.athlete;
  const race = draft.planInput.race;
  const availability = draft.planInput.availability;

  async function importGarminBridgeFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    await onImportGarminBridgeFile(file);
  }

  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Athlete Setup</p>
        <h1>Setup</h1>
        <p>
          Import Garmin bridge data, refresh live weather, and save the current setup to{" "}
          {storageMode === "supabase" ? "Supabase" : "local browser storage"}.
        </p>
      </section>

      {authSession && (
        <AuthPanel
          session={authSession}
          onSendMagicLink={onSendMagicLink}
          onSignOut={onSignOut}
        />
      )}

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
          <label className="file-action full-width-action">
            <FileUp size={18} aria-hidden="true" />
            Import Garmin bridge
            <input
              aria-label="Garmin bridge JSON"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                void importGarminBridgeFile(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
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

        <article className="content-panel integration-panel">
          <div className="section-heading">
            <CloudSun size={20} aria-hidden="true" />
            <h2>Weather Integration</h2>
          </div>
          <label className="text-control">
            <span>Location name</span>
            <input
              aria-label="Location name"
              value={draft.location.name}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  location: { ...draft.location, name: event.target.value },
                })
              }
            />
          </label>
          <label className="text-control">
            <span>Latitude</span>
            <input
              aria-label="Latitude"
              type="number"
              step="0.0001"
              value={draft.location.latitude}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  location: { ...draft.location, latitude: Number(event.target.value) },
                })
              }
            />
          </label>
          <label className="text-control">
            <span>Longitude</span>
            <input
              aria-label="Longitude"
              type="number"
              step="0.0001"
              value={draft.location.longitude}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  location: { ...draft.location, longitude: Number(event.target.value) },
                })
              }
            />
          </label>
          <button
            type="button"
            className="secondary-action full-width-action"
            onClick={() => onRefreshLiveWeather(draft)}
          >
            <CloudSun size={18} aria-hidden="true" />
            Refresh live weather
          </button>
        </article>
      </section>

      <section className="action-panel">
        <p>{saveStatus}</p>
        <div className="action-row">
          <button type="button" className="secondary-action" onClick={onReset}>
            <RotateCcw size={18} aria-hidden="true" />
            Reset local setup
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
