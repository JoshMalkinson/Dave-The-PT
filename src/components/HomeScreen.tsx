import { Clock, CloudSun, Flag, Gauge, Route } from "lucide-react";
import type { AthleteState, DailyRecommendation, RaceGoal } from "../domain/types";

interface HomeScreenProps {
  athlete: AthleteState;
  dailyRecommendation: DailyRecommendation;
  explanation: string;
  race: RaceGoal;
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
  race,
}: HomeScreenProps) {
  return (
    <div className="screen-stack">
      <section className="hero-panel" aria-labelledby="mission-heading">
        <div className="hero-copy">
          <p className="eyebrow">Today's Mission</p>
          <h1 id="mission-heading">Today's Mission</h1>
          <h2 className="mission-title">{dailyRecommendation.workout.title}</h2>
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
          <span>{race.distance}</span>
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
    </div>
  );
}
