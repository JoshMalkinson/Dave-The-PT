import type { TrainingWindow, WeatherDay, WeatherLevel, WeatherRisk, WeatherScore } from "./types";

function levelForScore(score: number, risks: WeatherRisk[]): WeatherLevel {
  if (risks.includes("storm")) {
    return "unsafe";
  }

  if (score >= 85) {
    return "ideal";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 50) {
    return "compromised";
  }

  return "poor";
}

function recommendedWindowFor(day: WeatherDay): TrainingWindow {
  return day.eveningTempC + 4 < day.morningTempC ? "evening" : "morning";
}

export function scoreWeather(day: WeatherDay): WeatherScore {
  const risks: WeatherRisk[] = [];
  let score = 100;

  if (day.thunderstormProbabilityPercent >= 60) {
    risks.push("storm");
    score -= 70;
  }

  if (day.morningTempC >= 32 || day.eveningTempC >= 32) {
    risks.push("heat");
    score -= 42;
  }

  if (day.humidityPercent >= 68) {
    risks.push("humidity");
    score -= 15;
  }

  if (day.windKph >= 28) {
    risks.push("wind");
    score -= 32;
  }

  if (day.rainProbabilityPercent >= 65 && !risks.includes("storm")) {
    risks.push("rain");
    score -= 18;
  }

  if (day.uvIndex >= 8) {
    risks.push("uv");
    score -= 10;
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const level = levelForScore(boundedScore, risks);
  const recommendedWindow = recommendedWindowFor(day);
  const summary =
    level === "ideal"
      ? "Mild, dry conditions with low weather stress."
      : `Weather is ${level} with ${risks.join(", ")} risk.`;

  return {
    score: boundedScore,
    level,
    risks,
    recommendedWindow,
    summary,
  };
}
