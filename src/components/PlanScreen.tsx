import type { AdaptiveWeek } from "../domain/types";
import { MtbWeeklyPlanner } from "./MtbWeeklyPlanner";

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
          The engine fits the required mountain bike workouts into the best available
          windows, then exports the week for daily Garmin watch sync.
        </p>
      </section>

      <MtbWeeklyPlanner week={week} />
    </div>
  );
}
