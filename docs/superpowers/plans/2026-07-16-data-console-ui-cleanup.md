# Data Console UI Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce visual noise and remove race-first UI so Dave The PT reads as a data-driven MTB training console.

**Architecture:** Keep the current React/Vite structure and make a focused UI pass across Home, Setup, and shared CSS. Do not change storage or training-engine data contracts in this slice; hide non-useful race UI from the product surface while preserving underlying compatibility.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Playwright Core with local Chrome.

## Global Constraints

- Keep the app mobile-friendly and website-friendly.
- Do not expose raw latitude/longitude in the Setup UI.
- Remove target race UI from the visible product surface.
- Preserve Garmin, Strava, weather, and local bridge workflows.
- Run Vitest, build, audit, and Playwright desktop/mobile walkthrough before completion.

---

### Task 1: Home Data Console

**Files:**
- Modify: `src/components/HomeScreen.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: existing `HomeScreenProps`.
- Produces: Home screen without visible target race countdown.

- [ ] Write tests that Home no longer shows the target race name or days-until-race metric.
- [ ] Replace the large mission hero copy with compact Today summary copy.
- [ ] Keep readiness, recovery, weather, and training window visible.
- [ ] Run `npm.cmd test -- --run src/App.test.tsx`.

### Task 2: Setup Integration Console

**Files:**
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: existing Setup callbacks and `PlanData`.
- Produces: Setup screen focused on Garmin, Weather, Strava, Availability, and persistence actions.

- [ ] Write tests that `Goal Race`, `Race name`, and `Race date` are absent from Setup.
- [ ] Remove editable target race card from Setup.
- [ ] Keep Garmin sliders/import, Weather refresh, Strava connect, Availability, Save, and Reset.
- [ ] Run `npm.cmd test -- --run src/App.test.tsx`.

### Task 3: Visual System Cleanup

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/PlanScreen.tsx`
- Modify: `src/components/MtbWeeklyPlanner.tsx` if needed for copy density.

**Interfaces:**
- Produces: calmer data-product styling without heavy hero treatment.

- [ ] Change global font stack to a cleaner system UI stack.
- [ ] Reduce oversized headings, shadows, gradients, and heavy chip styling.
- [ ] Make panels quieter and more compact.
- [ ] Keep touch targets usable on mobile.

### Task 4: Verification

**Files:**
- No production files.

**Interfaces:**
- Produces: verification evidence.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Run Playwright desktop and mobile walkthrough against `http://127.0.0.1:5173/`.
- [ ] Confirm no console errors, failed requests, page errors, or bad responses.
