# Adaptive Coach MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first mobile-friendly PWA MVP for an adaptive Garmin-style running coach.

**Architecture:** A Vite + React + TypeScript app with deterministic coaching logic in `src/domain` and responsive screens in `src/components`. The MVP uses seeded data and local UI state so the core product can be tested without third-party credentials.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS modules/plain CSS, PWA manifest.

## Global Constraints

- Training Engine makes all workout decisions.
- AI-style explanations only explain structured engine decisions.
- No live Garmin, weather, LLM, account, or push notification integration in MVP.
- Mobile-first responsive UI and installable PWA metadata are required.
- Every new domain behavior must have a failing test before implementation.

---

## File Structure

- `package.json`: scripts and dependencies.
- `vite.config.ts`: Vite and Vitest configuration.
- `index.html`: app mount and PWA metadata.
- `public/manifest.webmanifest`: install metadata.
- `src/domain/types.ts`: shared domain types.
- `src/domain/weatherEngine.ts`: weather scoring.
- `src/domain/trainingEngine.ts`: adaptive workout decisions.
- `src/domain/coachNarrator.ts`: bounded explanation text.
- `src/data/seedData.ts`: realistic demo data.
- `src/App.tsx`: screen routing and shared state.
- `src/components/*.tsx`: focused UI components.
- `src/styles.css`: responsive visual system.
- `src/domain/*.test.ts`: domain tests.
- `src/App.test.tsx`: UI smoke test.

## Task 1: Scaffold The PWA

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `public/manifest.webmanifest`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

**Interfaces:**
- Produces: React app shell with text `Today's Mission`.

- [ ] Create the Vite React TypeScript project files.
- [ ] Add a UI smoke test that renders `Today's Mission`.
- [ ] Run `npm install`.
- [ ] Run `npm test -- --run src/App.test.tsx` and confirm the smoke test passes.
- [ ] Run `npm run build`.
- [ ] Commit with `chore: scaffold adaptive coach pwa`.

## Task 2: Weather Engine

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/weatherEngine.ts`
- Create: `src/domain/weatherEngine.test.ts`

**Interfaces:**
- Produces: `scoreWeather(day: WeatherDay): WeatherScore`.

- [ ] Write tests for ideal weather, heat risk, storm risk, wind risk, and evening recommendation.
- [ ] Run the test and confirm it fails because `scoreWeather` is missing.
- [ ] Implement the minimal scoring rules.
- [ ] Run `npm test -- --run src/domain/weatherEngine.test.ts`.
- [ ] Commit with `feat: add weather suitability engine`.

## Task 3: Training Engine

**Files:**
- Create: `src/domain/trainingEngine.ts`
- Create: `src/domain/trainingEngine.test.ts`
- Modify: `src/domain/types.ts`

**Interfaces:**
- Consumes: `scoreWeather(day: WeatherDay): WeatherScore`.
- Produces: `buildAdaptiveWeek(input: TrainingPlanInput): AdaptiveWeek`.

- [ ] Write tests for heat rescheduling, storm swapping, poor recovery downgrade, taper protection, and weekend long-run placement.
- [ ] Run the test and confirm it fails because `buildAdaptiveWeek` is missing.
- [ ] Implement deterministic adaptation rules.
- [ ] Run `npm test -- --run src/domain/trainingEngine.test.ts`.
- [ ] Commit with `feat: add adaptive training engine`.

## Task 4: Coach Narrator And Seed Data

**Files:**
- Create: `src/domain/coachNarrator.ts`
- Create: `src/domain/coachNarrator.test.ts`
- Create: `src/data/seedData.ts`

**Interfaces:**
- Consumes: `DailyRecommendation`.
- Produces: `explainRecommendation(recommendation: DailyRecommendation): string`.

- [ ] Write tests that explanations stay under 120 words and include engine reasons.
- [ ] Run the test and confirm it fails because `explainRecommendation` is missing.
- [ ] Implement deterministic coach copy from structured reasons.
- [ ] Add seeded athlete, race, workouts, availability, weather, and metric data.
- [ ] Run `npm test -- --run src/domain/coachNarrator.test.ts`.
- [ ] Commit with `feat: add coach explanations and demo data`.

## Task 5: Mobile-Friendly Product UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/HomeScreen.tsx`
- Create: `src/components/PlanScreen.tsx`
- Create: `src/components/ProgressScreen.tsx`
- Create: `src/components/SetupScreen.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `buildAdaptiveWeek(input)` and `explainRecommendation(recommendation)`.
- Produces: four-tab PWA UI.

- [ ] Update the UI smoke test to check Home, Plan, Progress, and Setup labels.
- [ ] Run the test and confirm it fails before the screens exist.
- [ ] Implement screen components and responsive CSS.
- [ ] Run `npm test -- --run src/App.test.tsx`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: build adaptive coach mvp interface`.

## Task 6: Final Verification And Push

**Files:**
- Modify only if verification reveals a bug.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Start the dev server and inspect the app in desktop and mobile viewport.
- [ ] Commit any verification fixes.
- [ ] Create or connect the GitHub repo.
- [ ] Push branch `codex/mvp`.
