create table public.strava_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strava_athlete_id bigint not null,
  athlete_name text,
  scopes text[] not null default '{}',
  expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.strava_connection_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.strava_activities (
  id bigint primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sport_type text not null,
  started_at timestamptz not null,
  distance_meters numeric not null default 0,
  moving_time_seconds integer not null default 0,
  elevation_gain_meters numeric not null default 0,
  average_speed_mps numeric,
  average_heartrate numeric,
  average_watts numeric,
  raw_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);

create table public.strava_rider_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activity_count integer not null default 0,
  typical_distance_km numeric(6, 1) not null default 0,
  typical_moving_speed_kph numeric(5, 1) not null default 0,
  typical_elevation_gain_meters integer not null default 0,
  climb_rate_meters_per_hour integer not null default 0,
  average_heart_rate integer,
  average_watts integer,
  calculated_at timestamptz not null default now()
);

create index strava_activities_user_started_idx
  on public.strava_activities (user_id, started_at desc);

alter table public.strava_connections enable row level security;
alter table public.strava_connection_tokens enable row level security;
alter table public.strava_activities enable row level security;
alter table public.strava_rider_profiles enable row level security;

create policy "strava connections are user readable" on public.strava_connections
  for select using (auth.uid() = user_id);

create policy "strava activities are user readable" on public.strava_activities
  for select using (auth.uid() = user_id);

create policy "strava rider profiles are user readable" on public.strava_rider_profiles
  for select using (auth.uid() = user_id);
