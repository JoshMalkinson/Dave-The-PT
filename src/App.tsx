import { useEffect, useMemo, useState } from "react";
import {
  createSupabaseAuthClient,
  type AuthSessionState,
  type SupabaseAuthClient,
} from "./auth/supabaseAuthClient";
import { AppShell, type Screen } from "./components/AppShell";
import { HomeScreen } from "./components/HomeScreen";
import { PlanScreen } from "./components/PlanScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { SetupScreen } from "./components/SetupScreen";
import { demoPlanData, type PlanData } from "./data/planData";
import { explainRecommendation } from "./domain/coachNarrator";
import { buildAdaptiveWeek } from "./domain/trainingEngine";
import { applyGarminDailyImport, demoGarminDailyImport } from "./integrations/garmin/garminImport";
import { fetchOpenMeteoWeather } from "./integrations/weather/openMeteoClient";
import { createPlanRepository } from "./storage/createPlanRepository";
import { createSupabaseBrowserClient } from "./storage/supabaseClient";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [planData, setPlanData] = useState<PlanData>(demoPlanData);
  const [saveStatus, setSaveStatus] = useState("Local demo data ready");
  const [authSession, setAuthSession] = useState<AuthSessionState | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseClient = useMemo(
    () =>
      supabaseUrl && supabaseAnonKey
        ? createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
        : null,
    [supabaseAnonKey, supabaseUrl],
  );
  const authClient = useMemo<SupabaseAuthClient | null>(
    () => (supabaseClient ? createSupabaseAuthClient(supabaseClient) : null),
    [supabaseClient],
  );
  const repository = useMemo(
    () =>
      createPlanRepository(
        {
          VITE_SUPABASE_URL: supabaseUrl,
          VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
        },
        window.localStorage,
        supabaseClient ?? undefined,
      ),
    [supabaseAnonKey, supabaseClient, supabaseUrl],
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

  useEffect(() => {
    if (!authClient) {
      setAuthSession(null);
      return;
    }

    let isMounted = true;

    authClient.getSessionState().then((state) => {
      if (isMounted) {
        setAuthSession(state);
      }
    });

    const unsubscribe = authClient.onAuthStateChange((state) => {
      setAuthSession(state);
      repository.load().then(setPlanData);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authClient, repository]);

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

  async function importDemoGarmin() {
    const nextPlanData = applyGarminDailyImport(planData, demoGarminDailyImport);
    await savePlanData(nextPlanData);
    setSaveStatus("Imported demo Garmin metrics");
  }

  async function refreshLiveWeather(nextPlanData: PlanData) {
    try {
      const weather = await fetchOpenMeteoWeather(nextPlanData.location);
      await savePlanData({
        ...nextPlanData,
        planInput: {
          ...nextPlanData.planInput,
          weather,
        },
      });
      setSaveStatus(`Weather refreshed for ${nextPlanData.location.name}`);
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Weather refresh failed");
    }
  }

  async function sendMagicLink(email: string) {
    if (!authClient) {
      return;
    }

    await authClient.sendMagicLink(email, window.location.href);
    setSaveStatus("Magic link requested");
  }

  async function signOut() {
    if (!authClient) {
      return;
    }

    await authClient.signOut();
    setAuthSession({ user: null, email: null, isSignedIn: false });
    setSaveStatus("Signed out of Supabase");
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
          authSession={authSession}
          planData={planData}
          saveStatus={saveStatus}
          storageMode={repository.mode}
          onReset={resetPlanData}
          onSave={savePlanData}
          onImportDemoGarmin={importDemoGarmin}
          onRefreshLiveWeather={refreshLiveWeather}
          onSendMagicLink={sendMagicLink}
          onSignOut={signOut}
        />
      )}
    </AppShell>
  );
}
