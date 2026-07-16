import type { TrainingPlanInput } from "../domain/types";

export interface ProgressMetric {
  label: string;
  value: string;
  change: string;
  tone: "good" | "steady" | "watch";
}

export interface TrendPoint {
  label: string;
  load: number;
  sleep: number;
  hrv: number;
}

export const demoPlanInput: TrainingPlanInput = {
  athlete: {
    name: "Dave",
    recoveryScore: 82,
    sleepHours: 7.4,
    hrvStatus: "balanced",
    hardWorkoutsLastFiveDays: 1,
  },
  race: {
    name: "Trailseeker MTB",
    distance: "Mountain bike marathon",
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
    {
      id: "aerobic-45",
      type: "easy",
      title: "Zone 2 Aerobic Spin",
      day: "Monday",
      durationMinutes: 45,
      intensity: "easy",
    },
    {
      id: "climb-threshold-50",
      type: "intervals",
      title: "Climb Threshold Repeats",
      day: "Tuesday",
      durationMinutes: 50,
      intensity: "hard",
    },
    {
      id: "strength-40",
      type: "strength",
      title: "Strength + Mobility",
      day: "Wednesday",
      durationMinutes: 40,
      intensity: "easy",
    },
    {
      id: "tempo-55",
      type: "tempo",
      title: "Sweet-Spot Trail Tempo",
      day: "Thursday",
      durationMinutes: 55,
      intensity: "moderate",
    },
    {
      id: "hill-charges-45",
      type: "hills",
      title: "Seated and Standing Hill Charges",
      day: "Saturday",
      durationMinutes: 45,
      intensity: "hard",
    },
  ],
  weather: [
    {
      date: "2026-07-06",
      label: "Monday",
      morningTempC: 19,
      eveningTempC: 17,
      humidityPercent: 58,
      windKph: 8,
      rainProbabilityPercent: 10,
      thunderstormProbabilityPercent: 0,
      uvIndex: 4,
      sunrise: "06:43",
      sunset: "17:38",
    },
    {
      date: "2026-07-07",
      label: "Tuesday",
      morningTempC: 35,
      eveningTempC: 24,
      humidityPercent: 72,
      windKph: 14,
      rainProbabilityPercent: 12,
      thunderstormProbabilityPercent: 0,
      uvIndex: 8,
      sunrise: "06:43",
      sunset: "17:39",
    },
    {
      date: "2026-07-08",
      label: "Wednesday",
      morningTempC: 20,
      eveningTempC: 17,
      humidityPercent: 60,
      windKph: 12,
      rainProbabilityPercent: 12,
      thunderstormProbabilityPercent: 0,
      uvIndex: 5,
      sunrise: "06:42",
      sunset: "17:39",
    },
    {
      date: "2026-07-09",
      label: "Thursday",
      morningTempC: 21,
      eveningTempC: 18,
      humidityPercent: 57,
      windKph: 9,
      rainProbabilityPercent: 12,
      thunderstormProbabilityPercent: 0,
      uvIndex: 5,
      sunrise: "06:42",
      sunset: "17:40",
    },
    {
      date: "2026-07-10",
      label: "Friday",
      morningTempC: 22,
      eveningTempC: 18,
      humidityPercent: 58,
      windKph: 9,
      rainProbabilityPercent: 10,
      thunderstormProbabilityPercent: 0,
      uvIndex: 5,
      sunrise: "06:42",
      sunset: "17:40",
    },
    {
      date: "2026-07-11",
      label: "Saturday",
      morningTempC: 33,
      eveningTempC: 26,
      humidityPercent: 66,
      windKph: 22,
      rainProbabilityPercent: 30,
      thunderstormProbabilityPercent: 20,
      uvIndex: 7,
      sunrise: "06:41",
      sunset: "17:41",
    },
    {
      date: "2026-07-12",
      label: "Sunday",
      morningTempC: 18,
      eveningTempC: 16,
      humidityPercent: 54,
      windKph: 7,
      rainProbabilityPercent: 5,
      thunderstormProbabilityPercent: 0,
      uvIndex: 4,
      sunrise: "06:41",
      sunset: "17:41",
    },
  ],
};

export const progressMetrics: ProgressMetric[] = [
  { label: "Weekly load", value: "428", change: "+6% vs last week", tone: "good" },
  { label: "Mileage", value: "42 km", change: "On target", tone: "steady" },
  { label: "Sleep", value: "7h 24m", change: "+38 min", tone: "good" },
  { label: "HRV", value: "Balanced", change: "3-day rise", tone: "good" },
  { label: "VO2 Max", value: "51", change: "Stable", tone: "steady" },
  { label: "Readiness", value: "82%", change: "Ready for quality", tone: "good" },
];

export const trendData: TrendPoint[] = [
  { label: "Mon", load: 42, sleep: 74, hrv: 66 },
  { label: "Tue", load: 68, sleep: 70, hrv: 65 },
  { label: "Wed", load: 36, sleep: 78, hrv: 70 },
  { label: "Thu", load: 58, sleep: 75, hrv: 72 },
  { label: "Fri", load: 20, sleep: 82, hrv: 76 },
  { label: "Sat", load: 76, sleep: 71, hrv: 68 },
  { label: "Sun", load: 92, sleep: 80, hrv: 74 },
];
