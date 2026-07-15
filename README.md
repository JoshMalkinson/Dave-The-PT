# Dave The PT

Dave The PT is a mobile-friendly adaptive running coach MVP. It combines athlete recovery state, race goals, weekly availability, weather, and Garmin-style metrics into a daily training recommendation.

## Current MVP

- React/Vite website with installable PWA metadata and an offline app shell.
- Local demo mode that works without any cloud credentials.
- Supabase schema, RLS policies, auth adapter, and signed-in plan persistence.
- Open-Meteo weather refresh for live forecasts.
- Garmin demo import mapper plus a local Garmin Connect bridge while official access is approval-gated.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## Supabase Mode

The app uses local browser storage when Supabase env vars are absent. To enable Supabase mode, create `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Then apply the database migration:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

More notes are in `docs/supabase-setup.md`. The Supabase personal access token used for CLI setup should be rotated or revoked after setup.

## Verify

```bash
npm test -- --run
npm run build
npm audit --audit-level=moderate
```

## Demo Flow

1. Open Home to review today's mission and coach explanation.
2. Open Setup and adjust recovery, sleep, HRV, goal race, or location.
3. Import demo Garmin metrics to update readiness.
4. Import a local Garmin bridge JSON file for real Garmin-derived demo data.
5. Refresh live weather to recalculate weather-aware recommendations.
6. Save setup locally or, when Supabase is configured and signed in, save it to the user's Supabase rows.

## Garmin Bridge

While Garmin developer approval is pending, use the local bridge in `tools/garmin_bridge_export.py` to generate `garmin-bridge-export.json` from a project-owned Garmin account. See `docs/garmin-bridge.md`.
