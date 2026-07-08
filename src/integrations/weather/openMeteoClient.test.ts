import { describe, expect, it, vi } from "vitest";
import { fetchOpenMeteoWeather } from "./openMeteoClient";
import type { TrainingLocation } from "../../data/planData";

const location: TrainingLocation = {
  name: "Johannesburg",
  latitude: -26.2041,
  longitude: 28.0473,
  timezone: "Africa/Johannesburg",
};

const responsePayload = {
  daily: {
    time: ["2026-07-08", "2026-07-09"],
    temperature_2m_max: [25, 34],
    temperature_2m_min: [12, 21],
    precipitation_probability_max: [10, 70],
    wind_speed_10m_max: [12, 34],
    uv_index_max: [4, 8],
    sunrise: ["2026-07-08T06:42", "2026-07-09T06:41"],
    sunset: ["2026-07-08T17:39", "2026-07-09T17:40"],
  },
  hourly: {
    time: [
      "2026-07-08T06:00",
      "2026-07-08T18:00",
      "2026-07-09T06:00",
      "2026-07-09T18:00",
    ],
    temperature_2m: [14, 19, 32, 27],
    relative_humidity_2m: [50, 58, 71, 66],
    precipitation_probability: [5, 10, 65, 50],
  },
};

describe("fetchOpenMeteoWeather", () => {
  it("requests a seven day forecast for the configured location", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responsePayload,
    });

    await fetchOpenMeteoWeather(location, fetcher);

    const requestedUrl = new URL(fetcher.mock.calls[0][0]);
    expect(requestedUrl.hostname).toBe("api.open-meteo.com");
    expect(requestedUrl.searchParams.get("latitude")).toBe("-26.2041");
    expect(requestedUrl.searchParams.get("longitude")).toBe("28.0473");
    expect(requestedUrl.searchParams.get("forecast_days")).toBe("7");
    expect(requestedUrl.searchParams.get("timezone")).toBe("Africa/Johannesburg");
  });

  it("maps Open-Meteo forecast data into WeatherDay records", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responsePayload,
    });

    const weather = await fetchOpenMeteoWeather(location, fetcher);

    expect(weather).toHaveLength(2);
    expect(weather[0]).toMatchObject({
      date: "2026-07-08",
      label: "Wednesday",
      morningTempC: 14,
      eveningTempC: 19,
      humidityPercent: 58,
      windKph: 12,
      rainProbabilityPercent: 10,
      thunderstormProbabilityPercent: 8,
      uvIndex: 4,
      sunrise: "06:42",
      sunset: "17:39",
    });
    expect(weather[1].label).toBe("Thursday");
    expect(weather[1].thunderstormProbabilityPercent).toBe(53);
  });

  it("throws a clear error when the weather API fails", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchOpenMeteoWeather(location, fetcher)).rejects.toThrow(
      "Open-Meteo request failed with status 500",
    );
  });
});
