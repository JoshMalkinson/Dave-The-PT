import { useMemo, useState } from "react";
import { AppShell, type Screen } from "./components/AppShell";
import { HomeScreen } from "./components/HomeScreen";
import { PlanScreen } from "./components/PlanScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { SetupScreen } from "./components/SetupScreen";
import { demoPlanInput, progressMetrics, trendData } from "./data/seedData";
import { explainRecommendation } from "./domain/coachNarrator";
import { buildAdaptiveWeek } from "./domain/trainingEngine";
import type { AthleteState } from "./domain/types";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [athlete, setAthlete] = useState<AthleteState>(demoPlanInput.athlete);

  const planInput = useMemo(
    () => ({
      ...demoPlanInput,
      athlete,
    }),
    [athlete],
  );

  const adaptiveWeek = useMemo(() => buildAdaptiveWeek(planInput), [planInput]);
  const today =
    adaptiveWeek.days.find((day) => day.date === "2026-07-08") ?? adaptiveWeek.days[0];
  const explanation = explainRecommendation(today);

  return (
    <AppShell activeScreen={activeScreen} onScreenChange={setActiveScreen}>
      {activeScreen === "home" && (
        <HomeScreen
          athlete={athlete}
          dailyRecommendation={today}
          explanation={explanation}
          race={demoPlanInput.race}
        />
      )}
      {activeScreen === "plan" && <PlanScreen week={adaptiveWeek} />}
      {activeScreen === "progress" && (
        <ProgressScreen metrics={progressMetrics} trendData={trendData} />
      )}
      {activeScreen === "setup" && (
        <SetupScreen
          athlete={athlete}
          availability={demoPlanInput.availability}
          race={demoPlanInput.race}
          onAthleteChange={setAthlete}
        />
      )}
    </AppShell>
  );
}
