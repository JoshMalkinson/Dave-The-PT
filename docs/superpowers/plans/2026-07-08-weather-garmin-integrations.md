# Weather And Garmin Integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live weather refresh support and a Garmin-ready import seam while keeping the app demoable without external credentials.

**Architecture:** Integration adapters live under `src/integrations`. Open-Meteo maps API responses to `WeatherDay[]`. Garmin import maps a provider-neutral metric payload to `PlanData`. React calls these adapters from Setup and persists the resulting `PlanData` through the existing repository abstraction.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, browser fetch, Open-Meteo Forecast API.

## Global Constraints

- Garmin official API access is not required for this slice.
- Open-Meteo failures must leave existing weather data intact.
- Supabase credentials remain optional; local demo storage must still work.
- Training Engine makes all workout decisions.
- Every new behavior must have a failing test before implementation.

---

## Task 1: Open-Meteo Weather Adapter

**Files:**
- Create: `src/integrations/weather/openMeteoClient.ts`
- Create: `src/integrations/weather/openMeteoClient.test.ts`
- Modify: `src/data/planData.ts`

**Interfaces:**
- Produces: `fetchOpenMeteoWeather(location: TrainingLocation, fetcher?: typeof fetch): Promise<WeatherDay[]>`.

- [ ] Write failing tests for request URL and forecast mapping.
- [ ] Add `TrainingLocation` to `PlanData`.
- [ ] Implement Open-Meteo fetch and mapping.
- [ ] Run focused weather integration tests.
- [ ] Commit with `feat: add open meteo weather adapter`.

## Task 2: Garmin Import Mapper

**Files:**
- Create: `src/integrations/garmin/garminImport.ts`
- Create: `src/integrations/garmin/garminImport.test.ts`

**Interfaces:**
- Produces: `applyGarminDailyImport(planData: PlanData, dailyImport: GarminDailyImport): PlanData`.

- [ ] Write failing tests for recovery, sleep, HRV, progress metric, and trend updates.
- [ ] Implement Garmin import mapper and demo payload.
- [ ] Run focused Garmin tests.
- [ ] Commit with `feat: add garmin import mapper`.

## Task 3: Setup Integration UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `fetchOpenMeteoWeather` and `applyGarminDailyImport`.
- Produces: Setup integration actions.

- [ ] Write failing UI tests for demo Garmin import and weather refresh.
- [ ] Add Setup integration controls and status text.
- [ ] Wire actions through App and repository save.
- [ ] Run focused UI tests.
- [ ] Commit with `feat: wire weather and garmin setup actions`.

## Task 4: Final Verification And Push

**Files:**
- Modify only if verification reveals a bug.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Browser-check Setup integrations.
- [ ] Push branch `codex/weather-garmin-integrations`.
- [ ] Open draft PR.
