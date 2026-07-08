# Supabase Demo Data Design

## Product Goal

Move Adaptive Coach from a seed-only prototype toward a demoable app with a real Postgres-backed data model. The app must still run without Supabase credentials so reviews, screenshots, and local demos never block on infrastructure.

## Database Choice

Use Supabase Postgres for the demoable product path. Postgres fits the product because athletes, races, availability windows, planned workouts, weather snapshots, Garmin metrics, and daily recommendations are relational. Supabase adds Auth and Row Level Security for browser-facing security while preserving a portable Postgres schema.

## MVP Slice Scope

This slice includes:

- SQL schema for the first app tables with RLS policies.
- Environment configuration for optional Supabase credentials.
- A typed plan repository interface.
- A Supabase repository adapter.
- A local repository adapter that persists to `localStorage`.
- App state that loads from the repository, saves setup edits, and falls back to demo data.
- A small UI indicator showing whether the app is using Supabase or local demo storage.

This slice does not include live Supabase project provisioning, OAuth login screens, Garmin OAuth, scheduled sync jobs, server-side Edge Functions, or production RLS deployment automation.

## Data Model

The first schema creates:

- `profiles`: one row per authenticated user.
- `athlete_settings`: recovery, sleep, HRV, and recent hard-session state.
- `race_goals`: the athlete's current race target.
- `availability_windows`: day/window availability.
- `planned_workouts`: planned workouts before adaptation.
- `weather_snapshots`: daily weather inputs used by the engine.
- `daily_recommendations`: persisted engine outputs for auditability and later notifications.
- `garmin_metric_snapshots`: time-series snapshots imported later from Garmin.

All user-owned tables include `user_id uuid references auth.users(id)`. RLS policies restrict reads and writes to `auth.uid() = user_id`.

## Runtime Architecture

React consumes a `PlanRepository` abstraction. `createPlanRepository()` checks environment configuration:

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist, use `SupabasePlanRepository`.
- Otherwise use `LocalPlanRepository`.

The app loads a `PlanData` object, feeds it into the existing deterministic training engine, and saves setup edits through the same repository. Supabase failures return a typed repository error, and the app falls back to local demo data with a visible status message.

## UI Changes

Setup becomes the first persistence editing surface:

- recovery score slider
- sleep hours slider
- HRV status segmented control
- race name input
- race date input
- save status text
- storage mode indicator
- reset-to-demo button

Home shows whether the app is running from Supabase or local demo storage.

## Testing Strategy

- Unit-test environment selection.
- Unit-test local repository load, save, and reset behavior using a fake storage implementation.
- Unit-test Supabase row mapping without contacting Supabase.
- UI-test that Setup saves edits and recalculates the visible plan.

## Release Definition

The slice is complete when the app can run with no environment variables using local persisted data, can be configured for Supabase through `.env`, includes a reviewed SQL schema, and all tests/build/audit pass.
