import { Clock, CloudSun, Flag, Gauge, Route } from "lucide-react";
import type { AthleteState, DailyRecommendation, RaceGoal } from "../domain/types";
import type { GarminInsight } from "../integrations/garmin/garminReport";
import type { PlanRepositoryMode } from "../storage/planRepository";

interface HomeScreenProps {
  athlete: AthleteState;
  dailyRecommendation: DailyRecommendation;
  explanation: string;
  garminInsights: GarminInsight[];
  race: RaceGoal;
  storageMode: PlanRepositoryMode;
}

function minutesLabel(minutes: number) {
  if (minutes === 0) {
    return "Rest day";
  }

  return `${minutes} min`;
}

export function HomeScreen({
  athlete,
  dailyRecommendation,
  explanation,
  garminInsights,
  race,
  storageMode,
}: HomeScreenProps) {
  return (
    <div className="screen-stack">
      <section className="hero-panel" aria-labelledby="mission-heading">
        <div className="hero-copy">
          <p className="eyebrow">Today's Mission</p>
          <h1 id="mission-heading">Today's Mission</h1>
          <h2 className="mission-title">{dailyRecommendation.workout.title}</h2>
          <p className="storage-status">
            {storageMode === "supabase" ? "Supabase ready" : "Local browser storage"}
          </p>
          <p className="hero-summary">
            {minutesLabel(dailyRecommendation.workout.durationMinutes)} at{" "}
            {dailyRecommendation.scheduledWindow}. {dailyRecommendation.reasons[0]}
          </p>
        </div>
        <div className="readiness-dial" aria-label={`Readiness ${athlete.recoveryScore}%`}>
          <span>{athlete.recoveryScore}%</span>
          <small>Readiness</small>
        </div>
      </section>

      <section className="metric-grid" aria-label="Daily context">
        <article className="metric-tile">
          <Gauge size={20} aria-hidden="true" />
          <span>Recovery</span>
          <strong>{athlete.hrvStatus}</strong>
        </article>
        <article className="metric-tile">
          <CloudSun size={20} aria-hidden="true" />
          <span>Weather</span>
          <strong>{dailyRecommendation.weatherScore.level}</strong>
        </article>
        <article className="metric-tile">
          <Flag size={20} aria-hidden="true" />
          <span>{race.name}</span>
          <strong>{dailyRecommendation.daysUntilRace} days</strong>
        </article>
        <article className="metric-tile">
          <Clock size={20} aria-hidden="true" />
          <span>Window</span>
          <strong>{dailyRecommendation.scheduledWindow}</strong>
        </article>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <Route size={20} aria-hidden="true" />
          <h2>Coach's Explanation</h2>
        </div>
        <p className="coach-copy">{explanation}</p>
        <div className="reason-list">
          {dailyRecommendation.reasons.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      </section>

      {garminInsights.length > 0 && (
        <section className="content-panel">
          <div className="section-heading">
            <Gauge size={20} aria-hidden="true" />
            <h2>Garmin Insights</h2>
          </div>
          <div className="insight-list">
            {garminInsights.slice(0, 3).map((insight) => (
              <article className={`insight-card ${insight.tone}`} key={insight.title}>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
