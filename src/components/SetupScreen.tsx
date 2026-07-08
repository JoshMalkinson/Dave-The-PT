import { Moon, Settings2, Watch } from "lucide-react";
import type { AthleteState, RaceGoal, WeeklyAvailability } from "../domain/types";

interface SetupScreenProps {
  athlete: AthleteState;
  availability: WeeklyAvailability;
  race: RaceGoal;
  onAthleteChange: (athlete: AthleteState) => void;
}

export function SetupScreen({
  athlete,
  availability,
  race,
  onAthleteChange,
}: SetupScreenProps) {
  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Athlete Setup</p>
        <h1>Setup</h1>
        <p>
          Tune the simulated Garmin state and watch the engine adapt the week.
          Live accounts and OAuth belong in the next release.
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
                onAthleteChange({
                  ...athlete,
                  recoveryScore: Number(event.target.value),
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
                onAthleteChange({
                  ...athlete,
                  sleepHours: Number(event.target.value),
                })
              }
            />
          </label>
        </article>

        <article className="content-panel">
          <div className="section-heading">
            <Settings2 size={20} aria-hidden="true" />
            <h2>Goal Race</h2>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Race</dt>
              <dd>{race.name}</dd>
            </div>
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
    </div>
  );
}
