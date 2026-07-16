import { useEffect, useState } from "react";
import { CloudSun, FileUp, Moon, RotateCcw, Save, Watch } from "lucide-react";
import type { AuthSessionState } from "../auth/supabaseAuthClient";
import type { PlanData } from "../data/planData";
import type { PlanRepositoryMode } from "../storage/planRepository";
import { AuthPanel } from "./AuthPanel";
import { StravaIntegrationPanel } from "./StravaIntegrationPanel";

interface SetupScreenProps {
  authSession: AuthSessionState | null;
  planData: PlanData;
  saveStatus: string;
  storageMode: PlanRepositoryMode;
  stravaClientId?: string;
  stravaStatus: string;
  onReset: () => Promise<void>;
  onConnectStrava: () => void;
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
  stravaClientId,
  stravaStatus,
  onConnectStrava,
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
        <p className="eyebrow">Data setup</p>
        <h1>Data setup</h1>
        <p>
          Connect the data sources that drive the recommendation engine and save the current setup to{" "}
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
          <dl className="detail-list compact">
            <div>
              <dt>Weather location</dt>
              <dd>{draft.location.name}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{draft.location.timezone}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="secondary-action full-width-action"
            onClick={() => onRefreshLiveWeather(draft)}
          >
            <CloudSun size={18} aria-hidden="true" />
            Refresh live weather
          </button>
        </article>

        <StravaIntegrationPanel
          clientId={stravaClientId}
          isSignedIn={Boolean(authSession?.isSignedIn)}
          status={stravaStatus}
          onConnect={onConnectStrava}
        />
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
