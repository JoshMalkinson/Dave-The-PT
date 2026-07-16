import { describe, expect, it } from "vitest";
import { explainRecommendation } from "./coachNarrator";
import type { DailyRecommendation } from "./types";

const recommendation: DailyRecommendation = {
  date: "2026-07-08",
  label: "Wednesday",
  workout: {
    id: "intervals",
    type: "intervals",
    title: "6 x 1 km Intervals",
    day: "Wednesday",
    durationMinutes: 60,
    intensity: "hard",
  },
  scheduledWindow: "evening",
  weather: {
    date: "2026-07-08",
    label: "Wednesday",
    morningTempC: 35,
    eveningTempC: 24,
    humidityPercent: 72,
    windKph: 14,
    rainProbabilityPercent: 10,
    thunderstormProbabilityPercent: 0,
    uvIndex: 8,
    sunrise: "06:42",
    sunset: "17:39",
  },
  weatherScore: {
    score: 43,
    level: "poor",
    risks: ["heat", "humidity", "uv"],
    recommendedWindow: "evening",
    summary: "Weather is poor with heat, humidity, uv risk.",
  },
  readinessScore: 82,
  daysUntilRace: 31,
  reasons: ["Moved to evening for safer heat conditions."],
};

describe("explainRecommendation", () => {
  it("keeps the coach note under 120 words", () => {
    const copy = explainRecommendation(recommendation);

    expect(copy.split(/\s+/).length).toBeLessThanOrEqual(120);
  });

  it("includes the engine reason and selected workout", () => {
    const copy = explainRecommendation(recommendation);

    expect(copy).toContain("6 x 1 km Intervals");
    expect(copy).toContain("Moved to evening for safer heat conditions.");
  });

  it("keeps target race countdown out of the product surface", () => {
    const copy = explainRecommendation(recommendation);

    expect(copy).not.toContain("race day");
    expect(copy).not.toContain("31 days");
  });

  it("does not claim the model changed the workout", () => {
    const copy = explainRecommendation(recommendation);

    expect(copy).not.toMatch(/AI changed|I changed|model changed/i);
  });
});
