create extension if not exists pgcrypto;

create type public.hrv_status as enum ('low', 'balanced', 'high');
create type public.race_priority as enum ('A', 'B', 'C');
create type public.training_window as enum ('morning', 'evening');
create type public.workout_intensity as enum ('rest', 'easy', 'moderate', 'hard');
create type public.workout_type as enum (
  'easy',
  'recovery',
  'long',
  'tempo',
  'threshold',
  'intervals',
  'hills',
  'strength',
  'mobility',
  'rest'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Athlete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.athlete_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recovery_score integer not null check (recovery_score between 0 and 100),
  sleep_hours numeric(3, 1) not null check (sleep_hours between 0 and 24),
  hrv_status public.hrv_status not null default 'balanced',
  hard_workouts_last_five_days integer not null default 0 check (hard_workouts_last_five_days >= 0),
  updated_at timestamptz not null default now()
);

create table public.race_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  distance text not null,
  race_date date not null,
  priority public.race_priority not null default 'A',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_label text not null check (day_label in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  training_window public.training_window not null,
  unique (user_id, day_label, training_window)
);

create table public.planned_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_id text not null,
  workout_type public.workout_type not null,
  title text not null,
  day_label text not null check (day_label in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  duration_minutes integer not null check (duration_minutes >= 0),
  intensity public.workout_intensity not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, external_id)
);

create table public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  forecast_date date not null,
  day_label text not null check (day_label in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  morning_temp_c integer not null,
  evening_temp_c integer not null,
  humidity_percent integer not null check (humidity_percent between 0 and 100),
  wind_kph integer not null check (wind_kph >= 0),
  rain_probability_percent integer not null check (rain_probability_percent between 0 and 100),
  thunderstorm_probability_percent integer not null check (thunderstorm_probability_percent between 0 and 100),
  uv_index integer not null check (uv_index >= 0),
  sunrise text not null,
  sunset text not null,
  captured_at timestamptz not null default now(),
  unique (user_id, forecast_date)
);

create table public.daily_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_date date not null,
  workout_external_id text not null,
  scheduled_window public.training_window not null,
  readiness_score integer not null check (readiness_score between 0 and 100),
  days_until_race integer not null,
  reasons text[] not null default '{}',
  explanation text not null,
  engine_version text not null default 'mvp-rule-engine-v1',
  created_at timestamptz not null default now(),
  unique (user_id, recommendation_date, engine_version)
);

create table public.garmin_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  sleep_minutes integer,
  hrv_status public.hrv_status,
  recovery_score integer check (recovery_score between 0 and 100),
  resting_heart_rate integer,
  training_load integer,
  vo2_max numeric(4, 1),
  raw_payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

create index athlete_settings_user_id_idx on public.athlete_settings (user_id);
create index race_goals_user_id_date_idx on public.race_goals (user_id, race_date);
create index availability_windows_user_id_day_idx on public.availability_windows (user_id, day_label);
create index planned_workouts_user_id_day_idx on public.planned_workouts (user_id, day_label);
create index weather_snapshots_user_id_date_idx on public.weather_snapshots (user_id, forecast_date);
create index daily_recommendations_user_id_date_idx on public.daily_recommendations (user_id, recommendation_date);
create index garmin_metric_snapshots_user_id_date_idx on public.garmin_metric_snapshots (user_id, metric_date);

alter table public.profiles enable row level security;
alter table public.athlete_settings enable row level security;
alter table public.race_goals enable row level security;
alter table public.availability_windows enable row level security;
alter table public.planned_workouts enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.daily_recommendations enable row level security;
alter table public.garmin_metric_snapshots enable row level security;

create policy "profiles are user owned" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "athlete settings are user owned" on public.athlete_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "race goals are user owned" on public.race_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "availability windows are user owned" on public.availability_windows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "planned workouts are user owned" on public.planned_workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weather snapshots are user owned" on public.weather_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "daily recommendations are user owned" on public.daily_recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "garmin metric snapshots are user owned" on public.garmin_metric_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
