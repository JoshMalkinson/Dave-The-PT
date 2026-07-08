import { ArrowRight, CalendarDays, CloudLightning } from "lucide-react";
import type { AdaptiveWeek } from "../domain/types";

interface PlanScreenProps {
  week: AdaptiveWeek;
}

export function PlanScreen({ week }: PlanScreenProps) {
  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Dynamic Calendar</p>
        <h1>Adaptive Week</h1>
        <p>
          The engine fits the required workouts into the best available windows
          instead of locking the athlete to a brittle calendar.
        </p>
      </section>

      <section className="week-list" aria-label="Adaptive weekly plan">
        {week.days.map((day) => {
          const changed = day.originalWorkout && day.originalWorkout.id !== day.workout.id;
          return (
            <article className="day-card" key={day.date}>
              <div className="day-meta">
                <CalendarDays size={18} aria-hidden="true" />
                <span>{day.label}</span>
              </div>
              <div className="day-main">
                <h2>{day.workout.title}</h2>
                <p>
                  {day.workout.durationMinutes || "Rest"}{" "}
                  {day.workout.durationMinutes ? "min" : ""} · {day.scheduledWindow}
                </p>
              </div>
              <div className="weather-chip">
                <CloudLightning size={16} aria-hidden="true" />
                {day.weatherScore.level}
              </div>
              {changed && (
                <p className="change-note">
                  {day.originalWorkout?.title} <ArrowRight size={14} aria-hidden="true" />{" "}
                  {day.workout.title}
                </p>
              )}
              <p className="reason-note">{day.reasons[0]}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
