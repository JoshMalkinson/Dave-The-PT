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

export type DayLabel =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type WorkoutType =
  | "easy"
  | "recovery"
  | "long"
  | "tempo"
  | "threshold"
  | "intervals"
  | "hills"
  | "strength"
  | "mobility"
  | "rest";

export type WorkoutIntensity = "rest" | "easy" | "moderate" | "hard";

export interface Workout {
  id: string;
  type: WorkoutType;
  title: string;
  day: DayLabel;
  durationMinutes: number;
  intensity: WorkoutIntensity;
}

export interface AthleteState {
  name: string;
  recoveryScore: number;
  sleepHours: number;
  hrvStatus: "low" | "balanced" | "high";
  hardWorkoutsLastFiveDays: number;
}

export interface RaceGoal {
  name: string;
  distance: string;
  date: string;
  priority: "A" | "B" | "C";
}

export type WeeklyAvailability = Record<DayLabel, TrainingWindow[]>;

export interface TrainingPlanInput {
  athlete: AthleteState;
  race: RaceGoal;
  availability: WeeklyAvailability;
  workouts: Workout[];
  weather: WeatherDay[];
}

export interface DailyRecommendation {
  date: string;
  label: DayLabel;
  workout: Workout;
  originalWorkout?: Workout;
  scheduledWindow: TrainingWindow;
  weather: WeatherDay;
  weatherScore: WeatherScore;
  readinessScore: number;
  daysUntilRace: number;
  reasons: string[];
}

export interface AdaptiveWeek {
  days: DailyRecommendation[];
  generatedAt: string;
}
