import type {
  AdaptiveWeek,
  DailyRecommendation,
  DayLabel,
  TrainingPlanInput,
  TrainingWindow,
  WeatherDay,
  Workout,
} from "./types";
import { scoreWeather } from "./weatherEngine";

const dayOrder: DayLabel[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const restWorkout: Workout = {
  id: "rest",
  type: "rest",
  title: "Complete Rest",
  day: "Friday",
  durationMinutes: 0,
  intensity: "rest",
};

function daysUntil(date: string, targetDate: string): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.ceil((Date.parse(targetDate) - Date.parse(date)) / dayMs);
}

function defaultWindow(availability: TrainingWindow[]): TrainingWindow {
  return availability[0] ?? "morning";
}

function isOutdoorWorkout(workout: Workout): boolean {
  return workout.type !== "strength" && workout.type !== "mobility" && workout.type !== "rest";
}

function recoveryWorkout(day: DayLabel): Workout {
  return {
    id: `recovery-${day.toLowerCase()}`,
    type: "recovery",
    title: "45 min Zone 2 Recovery Spin",
    day,
    durationMinutes: 45,
    intensity: "easy",
  };
}

function capWorkoutForTaper(workout: Workout): Workout {
  return {
    ...workout,
    title: `Controlled ${workout.title}`,
    intensity: "moderate",
    durationMinutes: Math.max(30, Math.round(workout.durationMinutes * 0.8)),
  };
}

function assignLongRunToBestWeekend(input: TrainingPlanInput, workoutsByDay: Map<DayLabel, Workout>) {
  const longRide = input.workouts.find((workout) => workout.type === "long");
  if (!longRide) {
    return new Map<DayLabel, string[]>();
  }

  const reasonsByDay = new Map<DayLabel, string[]>();
  const saturday = input.weather.find((day) => day.label === "Saturday");
  const sunday = input.weather.find((day) => day.label === "Sunday");
  if (!saturday || !sunday) {
    return reasonsByDay;
  }

  const saturdayScore = scoreWeather(saturday);
  const sundayScore = scoreWeather(sunday);
  const shouldMoveToSunday =
    longRide.day === "Saturday" &&
    input.availability.Sunday.length > 0 &&
    sundayScore.score > saturdayScore.score + 20;

  if (!shouldMoveToSunday) {
    return reasonsByDay;
  }

  const sundayWorkout = workoutsByDay.get("Sunday") ?? { ...restWorkout, day: "Sunday" };
  workoutsByDay.set("Sunday", { ...longRide, day: "Sunday" });
  workoutsByDay.set("Saturday", { ...sundayWorkout, day: "Saturday" });
  reasonsByDay.set("Sunday", ["Long ride moved to the better weekend weather window."]);
  reasonsByDay.set("Saturday", ["Original long ride moved away from poor weekend weather."]);
  return reasonsByDay;
}

function swapUnsafeOutdoorWorkouts(input: TrainingPlanInput, workoutsByDay: Map<DayLabel, Workout>) {
  const reasonsByDay = new Map<DayLabel, string[]>();

  for (const day of dayOrder) {
    const workout = workoutsByDay.get(day);
    const weather = input.weather.find((weatherDay) => weatherDay.label === day);
    if (!workout || !weather || !isOutdoorWorkout(workout)) {
      continue;
    }

    if (scoreWeather(weather).level !== "unsafe") {
      continue;
    }

    const startIndex = dayOrder.indexOf(day);
    const swapDay = dayOrder.slice(startIndex + 1).find((candidate) => {
      const candidateWorkout = workoutsByDay.get(candidate);
      const candidateWeather = input.weather.find((weatherDay) => weatherDay.label === candidate);
      return (
        candidateWorkout &&
        candidateWeather &&
        scoreWeather(candidateWeather).level !== "unsafe" &&
        candidateWorkout.intensity !== "hard"
      );
    });

    if (!swapDay) {
      continue;
    }

    const swapWorkout = workoutsByDay.get(swapDay);
    if (!swapWorkout) {
      continue;
    }

    workoutsByDay.set(day, { ...swapWorkout, day });
    workoutsByDay.set(swapDay, { ...workout, day: swapDay });
    reasonsByDay.set(day, ["Thunderstorms made the original outdoor session unsafe."]);
    reasonsByDay.set(swapDay, ["Key workout moved here after storms affected its original slot."]);
  }

  return reasonsByDay;
}

function mergeReasons(...groups: Array<string[] | undefined>): string[] {
  return groups.flatMap((group) => group ?? []);
}

export function buildAdaptiveWeek(input: TrainingPlanInput): AdaptiveWeek {
  const workoutsByDay = new Map<DayLabel, Workout>();
  for (const workout of input.workouts) {
    workoutsByDay.set(workout.day, workout);
  }

  const longRunReasons = assignLongRunToBestWeekend(input, workoutsByDay);
  const stormReasons = swapUnsafeOutdoorWorkouts(input, workoutsByDay);

  const days: DailyRecommendation[] = input.weather.map((weatherDay: WeatherDay) => {
    const label = weatherDay.label as DayLabel;
    const originalWorkout = input.workouts.find((workout) => workout.day === label);
    let workout = workoutsByDay.get(label) ?? { ...restWorkout, day: label };
    const weatherScore = scoreWeather(weatherDay);
    const reasons = mergeReasons(longRunReasons.get(label), stormReasons.get(label));
    const availability = input.availability[label] ?? [];
    let scheduledWindow = defaultWindow(availability);
    const raceCountdown = daysUntil(weatherDay.date, input.race.date);

    if (
      weatherScore.risks.includes("heat") &&
      weatherScore.recommendedWindow === "evening" &&
      availability.includes("evening") &&
      workout.intensity !== "easy" &&
      workout.intensity !== "rest"
    ) {
      scheduledWindow = "evening";
      reasons.push("Moved to evening for safer heat conditions.");
    }

    if (
      input.athlete.recoveryScore < 50 &&
      input.athlete.sleepHours < 6 &&
      workout.intensity === "hard"
    ) {
      workout = recoveryWorkout(label);
      reasons.push("Recovery and sleep are too low for intensity.");
    }

    if (input.athlete.hardWorkoutsLastFiveDays >= 3 && workout.intensity === "hard") {
      workout = recoveryWorkout(label);
      reasons.push("Three hard sessions in five days triggered a recovery safeguard.");
    }

    if (raceCountdown <= 14 && raceCountdown >= 0 && workout.intensity === "hard") {
      workout = capWorkoutForTaper(workout);
      reasons.push("Race is within 14 days, so intensity is capped.");
    }

    if (reasons.length === 0) {
      reasons.push("Plan stayed on schedule because readiness and conditions support it.");
    }

    return {
      date: weatherDay.date,
      label,
      workout,
      originalWorkout,
      scheduledWindow,
      weather: weatherDay,
      weatherScore,
      readinessScore: input.athlete.recoveryScore,
      daysUntilRace: raceCountdown,
      reasons,
    };
  });

  return {
    days,
    generatedAt: new Date().toISOString(),
  };
}
