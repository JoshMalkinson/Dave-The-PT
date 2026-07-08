export type TrainingWindow = "morning" | "evening";

export type WeatherRisk = "heat" | "humidity" | "wind" | "rain" | "storm" | "uv";

export type WeatherLevel = "ideal" | "good" | "compromised" | "poor" | "unsafe";

export interface WeatherDay {
  date: string;
  label: string;
  morningTempC: number;
  eveningTempC: number;
  humidityPercent: number;
  windKph: number;
  rainProbabilityPercent: number;
  thunderstormProbabilityPercent: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherScore {
  score: number;
  level: WeatherLevel;
  risks: WeatherRisk[];
  recommendedWindow: TrainingWindow;
  summary: string;
}
