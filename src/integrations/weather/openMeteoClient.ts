import type { TrainingLocation } from "../../data/planData";
import type { DayLabel, WeatherDay } from "../../domain/types";

interface OpenMeteoResponse {
  daily: {
    time: string[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    uv_index_max: number[];
    wind_speed_10m_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
  };
}

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });

function timePart(value: string): string {
  return value.split("T")[1]?.slice(0, 5) ?? value;
}

function dayLabelFor(date: string): DayLabel {
  return dayFormatter.format(new Date(`${date}T00:00:00Z`)) as DayLabel;
}

function findHourlyIndex(payload: OpenMeteoResponse, date: string, hour: string): number {
  const exact = payload.hourly.time.findIndex((time) => time.startsWith(`${date}T${hour}`));
  if (exact >= 0) {
    return exact;
  }

  return payload.hourly.time.findIndex((time) => time.startsWith(`${date}T`));
}

function hourlyValue(values: number[], index: number, fallback: number): number {
  return index >= 0 ? Math.round(values[index]) : Math.round(fallback);
}

function buildOpenMeteoUrl(location: TrainingLocation): string {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    forecast_days: "7",
    timezone: location.timezone,
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export async function fetchOpenMeteoWeather(
  location: TrainingLocation,
  fetcher: typeof fetch = fetch,
): Promise<WeatherDay[]> {
  const response = await fetcher(buildOpenMeteoUrl(location));
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoResponse;

  return payload.daily.time.map((date, index) => {
    const morningIndex = findHourlyIndex(payload, date, "06:00");
    const eveningIndex = findHourlyIndex(payload, date, "18:00");
    const rainProbability = Math.round(payload.daily.precipitation_probability_max[index]);

    return {
      date,
      label: dayLabelFor(date),
      morningTempC: hourlyValue(
        payload.hourly.temperature_2m,
        morningIndex,
        payload.daily.temperature_2m_min[index],
      ),
      eveningTempC: hourlyValue(
        payload.hourly.temperature_2m,
        eveningIndex,
        payload.daily.temperature_2m_max[index],
      ),
      humidityPercent: hourlyValue(payload.hourly.relative_humidity_2m, eveningIndex, 60),
      windKph: Math.round(payload.daily.wind_speed_10m_max[index]),
      rainProbabilityPercent: rainProbability,
      thunderstormProbabilityPercent: Math.round(rainProbability * 0.75),
      uvIndex: Math.round(payload.daily.uv_index_max[index]),
      sunrise: timePart(payload.daily.sunrise[index]),
      sunset: timePart(payload.daily.sunset[index]),
    };
  });
}

export const openMeteoInternals = {
  buildOpenMeteoUrl,
};
