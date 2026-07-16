export interface StravaAuthorizationOptions {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}

export interface StravaTokenExchangeOptions {
  supabaseUrl: string;
  accessToken: string;
  code: string;
  redirectUri: string;
}

export interface StravaTokenExchangeResult {
  ok: boolean;
  message: string;
}

const defaultScopes = ["read", "activity:read_all", "profile:read_all"];

export function buildStravaAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  scopes = defaultScopes,
}: StravaAuthorizationOptions): string {
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", scopes.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeStravaAuthorizationCode(
  {
    supabaseUrl,
    accessToken,
    code,
    redirectUri,
  }: StravaTokenExchangeOptions,
  fetcher: typeof fetch = fetch,
): Promise<StravaTokenExchangeResult> {
  const response = await fetcher(`${supabaseUrl}/functions/v1/strava-token-exchange`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, redirectUri }),
  });
  const payload = (await response.json()) as Partial<StravaTokenExchangeResult>;

  if (!response.ok) {
    return {
      ok: false,
      message: payload.message ?? "Strava connection failed.",
    };
  }

  return {
    ok: payload.ok ?? true,
    message: payload.message ?? "Connected Strava.",
  };
}

export function createStravaOAuthState(): string {
  return `dave-strava:${crypto.randomUUID()}`;
}

export function isStravaOAuthState(state: string | null): boolean {
  return Boolean(state?.startsWith("dave-strava:"));
}
