import { describe, expect, it } from "vitest";
import { buildAdaptiveWeek } from "./trainingEngine";
import type { TrainingPlanInput } from "./types";

const baseInput: TrainingPlanInput = {
  athlete: {
    name: "Dave",
    recoveryScore: 82,
    sleepHours: 7.4,
    hrvStatus: "balanced",
    hardWorkoutsLastFiveDays: 1,
  },
  race: {
    name: "Cape Town Half",
    distance: "Half Marathon",
    date: "2026-08-08",
    priority: "A",
  },
  availability: {
    Monday: ["morning"],
    Tuesday: ["morning", "evening"],
    Wednesday: ["morning", "evening"],
    Thursday: ["morning", "evening"],
    Friday: [],
    Saturday: ["morning"],
    Sunday: ["morning"],
  },
  workouts: [
    { id: "easy", type: "easy", title: "Easy Run", day: "Monday", durationMinutes: 45, intensity: "easy" },
    { id: "intervals", type: "intervals", title: "6 x 1 km Intervals", day: "Tuesday", durationMinutes: 60, intensity: "hard" },
    { id: "strength", type: "strength", title: "Strength + Mobility", day: "Wednesday", durationMinutes: 40, intensity: "easy" },
    { id: "tempo", type: "tempo", title: "Tempo Run", day: "Thursday", durationMinutes: 55, intensity: "moderate" },
    { id: "long", type: "long", title: "Long Run", day: "Saturday", durationMinutes: 105, intensity: "moderate" },
  ],
  weather: [
    { date: "2026-07-06", label: "Monday", morningTempC: 19, eveningTempC: 17, humidityPercent: 58, windKph: 8, rainProbabilityPercent: 10, thunderstormProbabilityPercent: 0, uvIndex: 4, sunrise: "06:43", sunset: "17:38" },
    { date: "2026-07-07", label: "Tuesday", morningTempC: 18, eveningTempC: 16, humidityPercent: 56, windKph: 10, rainProbabilityPercent: 8, thunderstormProbabilityPercent: 0, uvIndex: 4, sunrise: "06:43", sunset: "17:39" },
    { date: "2026-07-08", label: "Wednesday", morningTempC: 20, eveningTempC: 17, humidityPercent: 60, windKph: 12, rainProbabilityPercent: 12, thunderstormProbabilityPercent: 0, uvIndex: 5, sunrise: "06:42", sunset: "17:39" },
    { date: "2026-07-09", label: "Thursday", morningTempC: 21, eveningTempC: 18, humidityPercent: 57, windKph: 9, rainProbabilityPercent: 12, thunderstormProbabilityPercent: 0, uvIndex: 5, sunrise: "06:42", sunset: "17:40" },
    { date: "2026-07-10", label: "Friday", morningTempC: 22, eveningTempC: 18, humidityPercent: 58, windKph: 9, rainProbabilityPercent: 10, thunderstormProbabilityPercent: 0, uvIndex: 5, sunrise: "06:42", sunset: "17:40" },
    { date: "2026-07-11", label: "Saturday", morningTempC: 20, eveningTempC: 16, humidityPercent: 55, windKph: 11, rainProbabilityPercent: 8, thunderstormProbabilityPercent: 0, uvIndex: 5, sunrise: "06:41", sunset: "17:41" },
    { date: "2026-07-12", label: "Sunday", morningTempC: 18, eveningTempC: 16, humidityPercent: 54, windKph: 7, rainProbabilityPercent: 5, thunderstormProbabilityPercent: 0, uvIndex: 4, sunrise: "06:41", sunset: "17:41" },
  ],
};

describe("buildAdaptiveWeek", () => {
  it("moves a hot hard workout to the cooler evening window", () => {
    const week = buildAdaptiveWeek({
      ...baseInput,
      weather: baseInput.weather.map((day) =>
        day.label === "Tuesday" ? { ...day, morningTempC: 35, eveningTempC: 24, humidityPercent: 72 } : day,
      ),
    });

    const tuesday = week.days.find((day) => day.label === "Tuesday");
    expect(tuesday?.workout.id).toBe("intervals");
    expect(tuesday?.scheduledWindow).toBe("evening");
    expect(tuesday?.reasons).toContain("Moved to evening for safer heat conditions.");
  });

  it("swaps a storm-hit interval session with the next suitable easy day", () => {
    const week = buildAdaptiveWeek({
      ...baseInput,
      weather: baseInput.weather.map((day) =>
        day.label === "Tuesday"
          ? { ...day, thunderstormProbabilityPercent: 80, rainProbabilityPercent: 90 }
          : day,
      ),
    });

    const tuesday = week.days.find((day) => day.label === "Tuesday");
    const wednesday = week.days.find((day) => day.label === "Wednesday");
    expect(tuesday?.workout.id).toBe("strength");
    expect(wednesday?.workout.id).toBe("intervals");
    expect(tuesday?.reasons).toContain("Thunderstorms made the original outdoor session unsafe.");
  });

  it("downgrades hard work when recovery and sleep are poor", () => {
    const week = buildAdaptiveWeek({
      ...baseInput,
      athlete: { ...baseInput.athlete, recoveryScore: 42, sleepHours: 5.2 },
    });

    const tuesday = week.days.find((day) => day.label === "Tuesday");
    expect(tuesday?.workout.type).toBe("recovery");
    expect(tuesday?.reasons).toContain("Recovery and sleep are too low for intensity.");
  });

  it("protects recovery during the final two-week taper", () => {
    const week = buildAdaptiveWeek({
      ...baseInput,
      race: { ...baseInput.race, date: "2026-07-18" },
    });

    const tuesday = week.days.find((day) => day.label === "Tuesday");
    expect(tuesday?.workout.intensity).toBe("moderate");
    expect(tuesday?.reasons).toContain("Race is within 14 days, so intensity is capped.");
  });

  it("places the long run on the best weekend weather day", () => {
    const week = buildAdaptiveWeek({
      ...baseInput,
      weather: baseInput.weather.map((day) =>
        day.label === "Saturday"
          ? { ...day, thunderstormProbabilityPercent: 70, rainProbabilityPercent: 90 }
          : day,
      ),
    });

    const saturday = week.days.find((day) => day.label === "Saturday");
    const sunday = week.days.find((day) => day.label === "Sunday");
    expect(saturday?.workout.type).not.toBe("long");
    expect(sunday?.workout.id).toBe("long");
    expect(sunday?.reasons).toContain("Long run moved to the better weekend weather window.");
  });
});
