# Supabase Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MVP demoable with real Supabase-backed user persistence when configured, while preserving browser-local demo mode.

**Architecture:** Keep Supabase concerns behind small adapters: one auth client for session actions and one plan repository for table reads/writes. React owns lightweight session state and passes auth actions into the Setup screen.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, Supabase JS v2, Supabase Postgres/RLS.

## Global Constraints

- Do not commit Supabase access tokens, database passwords, anon keys, service-role keys, or `.env.local`.
- The app must continue to run as a local demo when Supabase env vars are absent.
- Supabase mode must scope all reads and writes to `auth.getUser().data.user.id`.
- Tests must not call the live Supabase network.

---

### Task 1: Supabase Client Factory

**Files:**
- Create: `src/storage/supabaseClient.ts`
- Modify: `src/storage/createPlanRepository.ts`
- Test: `src/storage/createPlanRepository.test.ts`

**Interfaces:**
- Produces: `createSupabaseBrowserClient(url: string, anonKey: string): SupabaseClient`
- Consumes: existing `SupabasePlanRepository`

- [ ] Add a Supabase client factory so auth and repository code can share one browser client.
- [ ] Update repository creation to pass the shared client into `SupabasePlanRepository`.
- [ ] Verify local fallback still returns `LocalPlanRepository` when env vars are missing.

### Task 2: Auth Session Adapter

**Files:**
- Create: `src/auth/supabaseAuthClient.ts`
- Test: `src/auth/supabaseAuthClient.test.ts`

**Interfaces:**
- Produces: `SupabaseAuthClient` with `getSessionState`, `sendMagicLink`, `signOut`, and `onAuthStateChange`.
- Consumes: Supabase JS client auth methods.

- [ ] Add tests for signed-out state, signed-in state, magic-link requests, sign-out, and auth-state subscriptions using a fake client.
- [ ] Implement the adapter with no direct UI coupling.

### Task 3: Real Supabase Plan Persistence

**Files:**
- Modify: `src/storage/supabasePlanRepository.ts`
- Test: `src/storage/supabasePlanRepository.test.ts`

**Interfaces:**
- Consumes: `SupabaseClient`
- Produces: `load(): Promise<PlanData>`, `save(planData: PlanData): Promise<void>`, `reset(): Promise<void>`

- [ ] Test that signed-out `load` returns demo data and signed-out `save` is a no-op.
- [ ] Test that signed-in `save` upserts singleton tables and replaces collection tables.
- [ ] Test that signed-in `load` reads rows and maps them back to `PlanData`.
- [ ] Implement table writes with scoped deletes and inserts for availability, workouts, and weather.

### Task 4: Setup Auth UI

**Files:**
- Create: `src/components/AuthPanel.tsx`
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: a compact Supabase account panel in Setup.
- Consumes: auth state/actions from `App`.

- [ ] Show Supabase auth controls only when Supabase env vars are configured.
- [ ] Let a user request a magic link by email and sign out.
- [ ] Refresh persisted plan data after auth state changes.

### Task 5: Cloud Configuration Notes

**Files:**
- Modify: `.env.example`
- Create: `docs/supabase-setup.md`

**Interfaces:**
- Produces: setup notes for project URL, anon key, migrations, and token rotation.

- [ ] Document how to set frontend env vars locally.
- [ ] Document that the earlier personal access token should be rotated after setup.
- [ ] Keep all committed docs secret-free.

### Task 6: Verify and Publish

**Files:**
- All changed files.

**Interfaces:**
- Produces: pushed branch and draft PR into `codex/mvp`.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Stage intended files, commit, push, and open a draft PR.
