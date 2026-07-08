# Supabase Demo Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase/Postgres-ready persistence layer while keeping the app demoable with local storage fallback.

**Architecture:** The app reads and writes a `PlanData` object through a `PlanRepository` interface. Repository selection is environment-driven: Supabase when credentials exist, local storage otherwise. Existing training logic remains deterministic and receives data only through typed domain objects.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Supabase JS, Postgres SQL migrations.

## Global Constraints

- Supabase credentials are optional; the app must run without them.
- Training Engine makes all workout decisions.
- AI-style explanations only explain structured engine decisions.
- Browser-facing data access must be compatible with Supabase Row Level Security.
- Every new behavior must have a failing test before implementation.

---

## Task 1: Schema And Environment Contract

**Files:**
- Create: `supabase/migrations/20260708190000_initial_schema.sql`
- Create: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Produces documented env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

- [ ] Add SQL tables and RLS policies for profiles, athlete settings, race goals, availability windows, planned workouts, weather snapshots, daily recommendations, and Garmin metric snapshots.
- [ ] Add `.env.example` with Supabase browser credentials.
- [ ] Ensure `.env` remains ignored.
- [ ] Commit with `docs: add supabase schema contract`.

## Task 2: Plan Repository Types And Local Storage

**Files:**
- Create: `src/data/planData.ts`
- Create: `src/storage/planRepository.ts`
- Create: `src/storage/localPlanRepository.ts`
- Create: `src/storage/localPlanRepository.test.ts`
- Modify: `src/data/seedData.ts`

**Interfaces:**
- Produces: `PlanData`, `PlanRepository`, `LocalPlanRepository`.

- [ ] Write failing tests for local repository load defaults, save, and reset.
- [ ] Implement `PlanData` and move seed exports into a single `demoPlanData`.
- [ ] Implement local repository with injectable storage.
- [ ] Run `npm.cmd test -- --run src/storage/localPlanRepository.test.ts`.
- [ ] Commit with `feat: add local plan repository`.

## Task 3: Supabase Adapter And Repository Selection

**Files:**
- Create: `src/storage/supabasePlanRepository.ts`
- Create: `src/storage/supabasePlanRepository.test.ts`
- Create: `src/storage/createPlanRepository.ts`
- Create: `src/storage/createPlanRepository.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `PlanRepository`.
- Produces: `createPlanRepository(env): PlanRepository`.

- [ ] Install `@supabase/supabase-js`.
- [ ] Write failing tests for Supabase row mapping and environment-based repository selection.
- [ ] Implement Supabase row mapping and adapter skeleton.
- [ ] Implement repository factory.
- [ ] Run focused repository tests.
- [ ] Commit with `feat: add supabase repository adapter`.

## Task 4: App Integration And Editable Setup

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/HomeScreen.tsx`
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `PlanRepository`.
- Produces: UI that loads, saves, resets, and displays storage mode.

- [ ] Write failing UI test for saving recovery/race edits and seeing recalculated output.
- [ ] Wire app state to `createPlanRepository`.
- [ ] Expand Setup with race name/date and HRV status controls.
- [ ] Add storage mode/status indicator and reset-to-demo action.
- [ ] Run `npm.cmd test -- --run src/App.test.tsx`.
- [ ] Run `npm.cmd run build`.
- [ ] Commit with `feat: persist demo plan settings`.

## Task 5: Final Verification And Push

**Files:**
- Modify only if verification reveals a bug.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Start or refresh the dev server and inspect Home/Setup in browser.
- [ ] Push branch `codex/supabase-demo-data`.
