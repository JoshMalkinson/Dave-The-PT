import type { AdaptiveWeek } from "../domain/types";
import { MtbWeeklyPlanner } from "./MtbWeeklyPlanner";

interface PlanScreenProps {
  week: AdaptiveWeek;
}

export function PlanScreen({ week }: PlanScreenProps) {
  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Workout sync</p>
        <h1>Adaptive Week</h1>
        <p>
          Review each data-driven MTB workout, adjust the structure, then sync the
          selected week to Garmin.
        </p>
      </section>

      <MtbWeeklyPlanner week={week} />
    </div>
  );
}
