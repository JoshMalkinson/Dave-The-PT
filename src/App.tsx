import { useEffect, useMemo, useState } from "react";
import { AppShell, type Screen } from "./components/AppShell";
import { HomeScreen } from "./components/HomeScreen";
import { PlanScreen } from "./components/PlanScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { SetupScreen } from "./components/SetupScreen";
import { demoPlanData, type PlanData } from "./data/planData";
import { explainRecommendation } from "./domain/coachNarrator";
import { buildAdaptiveWeek } from "./domain/trainingEngine";
import { createPlanRepository } from "./storage/createPlanRepository";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [planData, setPlanData] = useState<PlanData>(demoPlanData);
  const [saveStatus, setSaveStatus] = useState("Local demo data ready");
  const repository = useMemo(
    () =>
      createPlanRepository({
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      }),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    repository.load().then((loadedPlanData) => {
      if (isMounted) {
        setPlanData(loadedPlanData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const adaptiveWeek = useMemo(() => buildAdaptiveWeek(planData.planInput), [planData]);
  const today =
    adaptiveWeek.days.find((day) => day.date === "2026-07-08") ?? adaptiveWeek.days[0];
  const explanation = explainRecommendation(today);

  async function savePlanData(nextPlanData: PlanData) {
    setPlanData(nextPlanData);
    await repository.save(nextPlanData);
    setSaveStatus(
      repository.mode === "supabase"
        ? "Saved through Supabase adapter"
        : "Saved in this browser",
    );
  }

  async function resetPlanData() {
    await repository.reset();
    setPlanData(demoPlanData);
    setSaveStatus("Reset to demo data");
  }

  return (
    <AppShell activeScreen={activeScreen} onScreenChange={setActiveScreen}>
      {activeScreen === "home" && (
        <HomeScreen
          athlete={planData.planInput.athlete}
          dailyRecommendation={today}
          explanation={explanation}
          race={planData.planInput.race}
          storageMode={repository.mode}
        />
      )}
      {activeScreen === "plan" && <PlanScreen week={adaptiveWeek} />}
      {activeScreen === "progress" && (
        <ProgressScreen metrics={planData.progressMetrics} trendData={planData.trendData} />
      )}
      {activeScreen === "setup" && (
        <SetupScreen
          planData={planData}
          saveStatus={saveStatus}
          storageMode={repository.mode}
          onReset={resetPlanData}
          onSave={savePlanData}
        />
      )}
    </AppShell>
  );
}
