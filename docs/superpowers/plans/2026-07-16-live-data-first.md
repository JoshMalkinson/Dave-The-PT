# Live Data First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the visible app rely on Garmin bridge/API imports and live weather rather than demo progress data.

**Architecture:** Leave bootstrap data in storage/domain tests, but gate visible Garmin reporting behind `garminReport` and refresh weather through the Open-Meteo adapter.

**Tech Stack:** React, TypeScript, Vitest.

## Global Constraints

- Do not remove bootstrap data needed for first render and tests.
- Do not show seeded progress metrics as Garmin data.
- Do not call live weather during Vitest runs.

---

### Task 1: Remove Demo Garmin UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/integrations/garmin/garminImport.ts`
- Modify: `src/integrations/garmin/garminImport.test.ts`

**Status:** Complete.

### Task 2: Gate Visible Progress Data

**Files:**
- Modify: `src/components/ProgressScreen.tsx`
- Modify: `src/App.test.tsx`

**Status:** Complete.

### Task 3: Refresh Weather Automatically

**Files:**
- Modify: `src/App.tsx`

**Status:** Complete.

### Task 4: Verify

**Files:**
- All changed files.

**Status:** Pending.
