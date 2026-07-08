# Supabase Setup

Dave The PT runs in browser-local demo mode when Supabase variables are absent. Add these values to `.env.local` to enable authenticated Supabase persistence:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
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

## Token Hygiene

The Supabase personal access token used for CLI setup should be rotated or revoked after project setup is complete. The frontend only needs the project URL and public anon key; never commit personal access tokens, database passwords, or service-role keys.
