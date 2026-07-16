import { describe, expect, it, vi } from "vitest";
import {
  buildStravaAuthorizationUrl,
  exchangeStravaAuthorizationCode,
} from "./stravaOAuth";

describe("Strava OAuth", () => {
  it("builds the user sign-in URL with MTB read scopes", () => {
    const url = buildStravaAuthorizationUrl({
      clientId: "123",
      redirectUri: "http://127.0.0.1:5173/",
      state: "dave-strava:test",
    });

    expect(url).toContain("https://www.strava.com/oauth/authorize");
    expect(url).toContain("client_id=123");
    expect(url).toContain("scope=read%2Cactivity%3Aread_all%2Cprofile%3Aread_all");
    expect(url).toContain("state=dave-strava%3Atest");
  });

  it("exchanges a returned code through the Supabase Edge Function", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: "Connected Strava." }),
    });

    await exchangeStravaAuthorizationCode(
      {
        supabaseUrl: "https://project.supabase.co",
        accessToken: "jwt",
        code: "strava-code",
        redirectUri: "http://127.0.0.1:5173/",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/functions/v1/strava-token-exchange",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt",
        }),
      }),
    );
  });
});
