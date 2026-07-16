import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope?: string;
  athlete?: {
    id: number;
    firstname?: string;
    lastname?: string;
  };
}

interface StravaActivity {
  id: number;
  name: string;
  sport_type?: string;
  type?: string;
  start_date: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  average_speed?: number;
  average_heartrate?: number;
  average_watts?: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const cyclingSportTypes = new Set([
  "Ride",
  "MountainBikeRide",
  "GravelRide",
  "VirtualRide",
  "EMountainBikeRide",
]);

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function average(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value) && value > 0);
  if (validValues.length === 0) {
    return 0;
  }
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function buildProfile(activities: StravaActivity[]) {
  const cyclingActivities = activities.filter((activity) =>
    cyclingSportTypes.has(activity.sport_type ?? activity.type ?? ""),
  );
  return {
    activity_count: cyclingActivities.length,
    typical_distance_km: Math.round(average(cyclingActivities.map((a) => a.distance / 1000)) * 10) / 10,
    typical_moving_speed_kph:
      Math.round(
        average(
          cyclingActivities.map((a) =>
            a.average_speed ? a.average_speed * 3.6 : (a.distance / Math.max(1, a.moving_time)) * 3.6,
          ),
        ) * 10,
      ) / 10,
    typical_elevation_gain_meters: Math.round(
      average(cyclingActivities.map((a) => a.total_elevation_gain)),
    ),
    climb_rate_meters_per_hour: Math.round(
      average(
        cyclingActivities.map((a) =>
          a.total_elevation_gain / (Math.max(1, a.moving_time) / 3600),
        ),
      ),
    ),
    average_heart_rate: Math.round(average(cyclingActivities.map((a) => a.average_heartrate ?? 0))) || null,
    average_watts: Math.round(average(cyclingActivities.map((a) => a.average_watts ?? 0))) || null,
    calculated_at: new Date().toISOString(),
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stravaClientId = Deno.env.get("STRAVA_CLIENT_ID");
  const stravaClientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stravaClientId || !stravaClientSecret) {
    return jsonResponse(500, { ok: false, message: "Strava function environment is incomplete." });
  }

  const authorization = request.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });
  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse(401, { ok: false, message: "Sign into Supabase before connecting Strava." });
  }

  const { code, redirectUri } = await request.json();
  if (typeof code !== "string" || typeof redirectUri !== "string") {
    return jsonResponse(400, { ok: false, message: "Missing Strava code or redirectUri." });
  }

  const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return jsonResponse(502, { ok: false, message: "Strava token exchange failed." });
  }

  const tokenPayload = (await tokenResponse.json()) as StravaTokenResponse;
  const userId = userData.user.id;
  const athleteName = [tokenPayload.athlete?.firstname, tokenPayload.athlete?.lastname]
    .filter(Boolean)
    .join(" ");
  const expiresAt = new Date(tokenPayload.expires_at * 1000).toISOString();

  await serviceClient.from("strava_connections").upsert({
    user_id: userId,
    strava_athlete_id: tokenPayload.athlete?.id,
    athlete_name: athleteName || null,
    scopes: tokenPayload.scope?.split(",") ?? [],
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
  await serviceClient.from("strava_connection_tokens").upsert({
    user_id: userId,
    access_token: tokenPayload.access_token,
    refresh_token: tokenPayload.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  const after = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
  const activitiesResponse = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&page=1&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    },
  );
  const activities = activitiesResponse.ok
    ? ((await activitiesResponse.json()) as StravaActivity[])
    : [];
  const cyclingActivities = activities.filter((activity) =>
    cyclingSportTypes.has(activity.sport_type ?? activity.type ?? ""),
  );

  if (cyclingActivities.length > 0) {
    await serviceClient.from("strava_activities").upsert(
      cyclingActivities.map((activity) => ({
        id: activity.id,
        user_id: userId,
        name: activity.name,
        sport_type: activity.sport_type ?? activity.type ?? "Ride",
        started_at: activity.start_date,
        distance_meters: activity.distance,
        moving_time_seconds: activity.moving_time,
        elevation_gain_meters: activity.total_elevation_gain,
        average_speed_mps: activity.average_speed ?? null,
        average_heartrate: activity.average_heartrate ?? null,
        average_watts: activity.average_watts ?? null,
        raw_payload: activity,
      })),
    );
  }

  await serviceClient.from("strava_rider_profiles").upsert({
    user_id: userId,
    ...buildProfile(activities),
  });

  return jsonResponse(200, {
    ok: true,
    message: `Connected Strava and imported ${cyclingActivities.length} rides.`,
    activitiesImported: cyclingActivities.length,
  });
});
