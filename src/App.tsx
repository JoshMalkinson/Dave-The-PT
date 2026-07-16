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
import { parseGarminBridgeExportJson } from "./integrations/garmin/garminBridgeImport";
import { applyGarminDailyImport } from "./integrations/garmin/garminImport";
import { buildGarminInsights } from "./integrations/garmin/garminReport";
import {
  buildStravaAuthorizationUrl,
  createStravaOAuthState,
  exchangeStravaAuthorizationCode,
  isStravaOAuthState,
} from "./integrations/strava/stravaOAuth";
import { fetchOpenMeteoWeather } from "./integrations/weather/openMeteoClient";
import { createPlanRepository } from "./storage/createPlanRepository";
import { createSupabaseBrowserClient } from "./storage/supabaseClient";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [planData, setPlanData] = useState<PlanData>(demoPlanData);
  const [saveStatus, setSaveStatus] = useState("Awaiting Garmin bridge import");
  const [stravaStatus, setStravaStatus] = useState("Strava is ready once configured");
  const [authSession, setAuthSession] = useState<AuthSessionState | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
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
        if (import.meta.env.MODE !== "test") {
          void refreshWeatherForPlanData(loadedPlanData, { persist: true });
        }
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !isStravaOAuthState(state)) {
      return;
    }
    if (!authClient || !supabaseUrl) {
      setStravaStatus("Sign into Supabase, then retry Strava connection.");
      return;
    }

    let isMounted = true;
    authClient
      .getAccessToken()
      .then((accessToken) => {
        if (!accessToken) {
          throw new Error("Sign into Supabase, then retry Strava connection.");
        }
        return exchangeStravaAuthorizationCode({
          supabaseUrl,
          accessToken,
          code,
          redirectUri: window.location.origin + window.location.pathname,
        });
      })
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setStravaStatus(result.message);
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((error) => {
        if (isMounted) {
          setStravaStatus(error instanceof Error ? error.message : "Strava connection failed");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authClient, supabaseUrl]);

  const adaptiveWeek = useMemo(() => buildAdaptiveWeek(planData.planInput), [planData]);
  const garminInsights = useMemo(
    () => (planData.garminReport ? buildGarminInsights(planData.garminReport) : []),
    [planData.garminReport],
  );
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
    setSaveStatus("Reset local setup; import Garmin bridge data to refresh metrics");
  }

  async function importGarminBridgeFile(file: File) {
    try {
      const bridgeExport = parseGarminBridgeExportJson(await file.text());
      const nextPlanData = {
        ...applyGarminDailyImport(planData, bridgeExport.dailyImport),
        garminReport: bridgeExport.reportData,
      };
      await savePlanData(nextPlanData);
      setSaveStatus(`Imported Garmin bridge file ${file.name}`);
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Garmin bridge import failed");
    }
  }

  async function refreshLiveWeather(nextPlanData: PlanData) {
    await refreshWeatherForPlanData(nextPlanData, { persist: true });
  }

  async function refreshWeatherForPlanData(
    nextPlanData: PlanData,
    options: { persist: boolean },
  ) {
    try {
      const weather = await fetchOpenMeteoWeather(nextPlanData.location);
      const planDataWithWeather = {
        ...nextPlanData,
        planInput: {
          ...nextPlanData.planInput,
          weather,
        },
      };
      setPlanData(planDataWithWeather);
      if (options.persist) {
        await repository.save(planDataWithWeather);
      }
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

  function connectStrava() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStravaStatus("Configure Supabase before connecting Strava.");
      return;
    }
    if (!stravaClientId) {
      setStravaStatus("Set VITE_STRAVA_CLIENT_ID after creating a Strava API app.");
      return;
    }
    if (!authSession?.isSignedIn) {
      setStravaStatus("Sign into Supabase before connecting Strava.");
      return;
    }

    window.location.href = buildStravaAuthorizationUrl({
      clientId: stravaClientId,
      redirectUri: window.location.origin + window.location.pathname,
      state: createStravaOAuthState(),
    });
  }

  return (
    <AppShell activeScreen={activeScreen} onScreenChange={setActiveScreen}>
      {activeScreen === "home" && (
        <HomeScreen
          athlete={planData.planInput.athlete}
          dailyRecommendation={today}
          explanation={explanation}
          garminInsights={garminInsights}
          race={planData.planInput.race}
          storageMode={repository.mode}
        />
      )}
      {activeScreen === "plan" && <PlanScreen week={adaptiveWeek} />}
      {activeScreen === "progress" && (
        <ProgressScreen
          garminReport={planData.garminReport}
          garminInsights={garminInsights}
        />
      )}
      {activeScreen === "setup" && (
        <SetupScreen
          authSession={authSession}
          planData={planData}
          saveStatus={saveStatus}
          storageMode={repository.mode}
          stravaClientId={stravaClientId}
          stravaStatus={stravaStatus}
          onConnectStrava={connectStrava}
          onReset={resetPlanData}
          onSave={savePlanData}
          onImportGarminBridgeFile={importGarminBridgeFile}
          onRefreshLiveWeather={refreshLiveWeather}
          onSendMagicLink={sendMagicLink}
          onSignOut={signOut}
        />
      )}
    </AppShell>
  );
}
