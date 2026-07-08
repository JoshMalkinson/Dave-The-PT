import { describe, expect, it } from "vitest";
import { scoreWeather } from "./weatherEngine";
import type { WeatherDay } from "./types";

const baseDay: WeatherDay = {
  date: "2026-07-08",
  label: "Wednesday",
  morningTempC: 18,
  eveningTempC: 17,
  humidityPercent: 58,
  windKph: 8,
  rainProbabilityPercent: 10,
  thunderstormProbabilityPercent: 0,
  uvIndex: 4,
  sunrise: "06:43",
  sunset: "17:38",
};

describe("scoreWeather", () => {
  it("scores mild dry conditions as ideal", () => {
    const score = scoreWeather(baseDay);

    expect(score.level).toBe("ideal");
    expect(score.score).toBeGreaterThanOrEqual(85);
    expect(score.risks).toEqual([]);
  });

  it("flags high heat and recommends evening when the evening is cooler", () => {
    const score = scoreWeather({
      ...baseDay,
      morningTempC: 35,
      eveningTempC: 24,
      humidityPercent: 70,
    });

    expect(score.level).toBe("poor");
    expect(score.recommendedWindow).toBe("evening");
    expect(score.risks).toContain("heat");
  });

  it("treats thunderstorms as unsafe for key outdoor work", () => {
    const score = scoreWeather({
      ...baseDay,
      thunderstormProbabilityPercent: 75,
      rainProbabilityPercent: 85,
    });

    expect(score.level).toBe("unsafe");
    expect(score.score).toBeLessThan(35);
    expect(score.risks).toContain("storm");
  });

  it("flags strong wind as a training risk", () => {
    const score = scoreWeather({
      ...baseDay,
      windKph: 34,
    });

    expect(score.level).toBe("compromised");
    expect(score.risks).toContain("wind");
  });

  it("keeps morning as the preferred window when morning is clearly better", () => {
    const score = scoreWeather({
      ...baseDay,
      morningTempC: 16,
      eveningTempC: 29,
    });

    expect(score.recommendedWindow).toBe("morning");
  });
});
