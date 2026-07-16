# Supabase Setup

Dave The PT runs in browser-local demo mode when Supabase variables are absent. Add these values to `.env.local` to enable authenticated Supabase persistence:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_STRAVA_CLIENT_ID=your-strava-client-id
```

## Database

Apply the schema in `supabase/migrations/20260708190000_initial_schema.sql` with the Supabase CLI:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

The migration enables row-level security on all MVP tables. Frontend reads and writes are scoped to the signed-in user's `auth.uid()`.

## Authentication

The MVP uses Supabase email magic links. In the Supabase dashboard, make sure the local and deployed app URLs are allowed redirect URLs for auth callbacks.

## Strava

Create a Strava API app at `https://www.strava.com/settings/api`. Add the Strava client id to `.env.local` as `VITE_STRAVA_CLIENT_ID`.

The Strava client secret must stay server-side. Store these Supabase Edge Function secrets:

```bash
npx supabase secrets set STRAVA_CLIENT_ID=your-strava-client-id
npx supabase secrets set STRAVA_CLIENT_SECRET=your-strava-client-secret
```

Deploy the token exchange function after linking the project:

```bash
npx supabase functions deploy strava-token-exchange
```

Use the app URL as the Strava OAuth callback domain. Locally, the redirect URI is `http://127.0.0.1:5173/`.

## Token Hygiene

The Supabase personal access token used for CLI setup should be rotated or revoked after project setup is complete. The frontend only needs the project URL, public anon key, and Strava client id; never commit personal access tokens, database passwords, Strava client secrets, refresh tokens, or service-role keys.
