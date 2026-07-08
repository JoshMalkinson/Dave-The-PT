import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoPlanData, type PlanData } from "../data/planData";
import type {
  DayLabel,
  TrainingWindow,
  WeatherDay,
  WeeklyAvailability,
  Workout,
} from "../domain/types";
import type { PlanRepository } from "./planRepository";

interface AthleteSettingsRow {
  user_id: string;
  recovery_score: number;
  sleep_hours: number;
  hrv_status: string;
  hard_workouts_last_five_days: number;
}

interface RaceGoalRow {
  user_id: string;
  name: string;
  distance: string;
  race_date: string;
  priority: string;
}

interface AvailabilityWindowRow {
  user_id: string;
  day_label: DayLabel;
  training_window: TrainingWindow;
}

interface PlannedWorkoutRow {
  user_id: string;
  external_id: string;
  workout_type: string;
  title: string;
  day_label: DayLabel;
  duration_minutes: number;
  intensity: string;
}

interface WeatherSnapshotRow {
  user_id: string;
  forecast_date: string;
  day_label: DayLabel;
  morning_temp_c: number;
  evening_temp_c: number;
  humidity_percent: number;
  wind_kph: number;
  rain_probability_percent: number;
  thunderstorm_probability_percent: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
}

export interface SupabasePlanRows {
  athleteSettings: AthleteSettingsRow;
  raceGoal: RaceGoalRow;
  availabilityWindows: AvailabilityWindowRow[];
  plannedWorkouts: PlannedWorkoutRow[];
  weatherSnapshots: WeatherSnapshotRow[];
}

export function mapPlanDataToSupabaseRows(
  planData: PlanData,
  userId: string,
): SupabasePlanRows {
  return {
    athleteSettings: {
      user_id: userId,
      recovery_score: planData.planInput.athlete.recoveryScore,
      sleep_hours: planData.planInput.athlete.sleepHours,
      hrv_status: planData.planInput.athlete.hrvStatus,
      hard_workouts_last_five_days: planData.planInput.athlete.hardWorkoutsLastFiveDays,
    },
    raceGoal: {
      user_id: userId,
      name: planData.planInput.race.name,
      distance: planData.planInput.race.distance,
      race_date: planData.planInput.race.date,
      priority: planData.planInput.race.priority,
    },
    availabilityWindows: Object.entries(planData.planInput.availability).flatMap(
      ([dayLabel, windows]) =>
        windows.map((window) => ({
          user_id: userId,
          day_label: dayLabel as DayLabel,
          training_window: window,
        })),
    ),
    plannedWorkouts: planData.planInput.workouts.map((workout) => ({
      user_id: userId,
      external_id: workout.id,
      workout_type: workout.type,
      title: workout.title,
      day_label: workout.day,
      duration_minutes: workout.durationMinutes,
      intensity: workout.intensity,
    })),
    weatherSnapshots: planData.planInput.weather.map((day) => ({
      user_id: userId,
      forecast_date: day.date,
      day_label: day.label as DayLabel,
      morning_temp_c: day.morningTempC,
      evening_temp_c: day.eveningTempC,
      humidity_percent: day.humidityPercent,
      wind_kph: day.windKph,
      rain_probability_percent: day.rainProbabilityPercent,
      thunderstorm_probability_percent: day.thunderstormProbabilityPercent,
      uv_index: day.uvIndex,
      sunrise: day.sunrise,
      sunset: day.sunset,
    })),
  };
}

export function mapSupabaseRowsToPlanData(rows: SupabasePlanRows): PlanData {
  const availability = rows.availabilityWindows.reduce<WeeklyAvailability>(
    (acc, row) => ({
      ...acc,
      [row.day_label]: [...acc[row.day_label], row.training_window],
    }),
    {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  );

  const workouts: Workout[] = rows.plannedWorkouts.map((row) => ({
    id: row.external_id,
    type: row.workout_type as Workout["type"],
    title: row.title,
    day: row.day_label,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity as Workout["intensity"],
  }));

  const weather: WeatherDay[] = rows.weatherSnapshots.map((row) => ({
    date: row.forecast_date,
    label: row.day_label,
    morningTempC: row.morning_temp_c,
    eveningTempC: row.evening_temp_c,
    humidityPercent: row.humidity_percent,
    windKph: row.wind_kph,
    rainProbabilityPercent: row.rain_probability_percent,
    thunderstormProbabilityPercent: row.thunderstorm_probability_percent,
    uvIndex: row.uv_index,
    sunrise: row.sunrise,
    sunset: row.sunset,
  }));

  return {
    ...demoPlanData,
    planInput: {
      athlete: {
        name: demoPlanData.planInput.athlete.name,
        recoveryScore: rows.athleteSettings.recovery_score,
        sleepHours: rows.athleteSettings.sleep_hours,
        hrvStatus: rows.athleteSettings.hrv_status as "low" | "balanced" | "high",
        hardWorkoutsLastFiveDays: rows.athleteSettings.hard_workouts_last_five_days,
      },
      race: {
        name: rows.raceGoal.name,
        distance: rows.raceGoal.distance,
        date: rows.raceGoal.race_date,
        priority: rows.raceGoal.priority as "A" | "B" | "C",
      },
      availability,
      workouts,
      weather,
    },
  };
}

export class SupabasePlanRepository implements PlanRepository {
  mode = "supabase" as const;

  private readonly client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  async load(): Promise<PlanData> {
    const { data } = await this.client.auth.getUser();
    if (!data.user) {
      return demoPlanData;
    }

    return demoPlanData;
  }

  async save(planData: PlanData): Promise<void> {
    const { data } = await this.client.auth.getUser();
    if (!data.user) {
      return;
    }

    mapPlanDataToSupabaseRows(planData, data.user.id);
  }

  async reset(): Promise<void> {
    await this.save(demoPlanData);
  }
}
