# MTB Workout Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an in-app adjustable MTB workout builder and connect it to the local Garmin workout bridge.

**Architecture:** Add a pure TypeScript MTB workout bridge mapper, a Plan screen builder component, and a Python `--input` mode for app-generated JSON.

**Tech Stack:** React, TypeScript, Vitest, Python local bridge.

## Global Constraints

- Mountain biking only.
- App must not handle Garmin credentials.
- Python upload must remain dry-run by default.

---

### Task 1: MTB Payload Mapper

**Files:**
- Create: `src/integrations/garmin/mtbWorkoutBridge.ts`
- Create: `src/integrations/garmin/mtbWorkoutBridge.test.ts`

**Interfaces:**
- Produces: `buildMtbWorkoutBridgeExport(draft)`

- [x] Build Garmin cycling workout payload for MTB templates.
- [x] Estimate adjusted duration.

### Task 2: Plan Screen Builder

**Files:**
- Create: `src/components/MtbWorkoutBuilder.tsx`
- Create: `src/components/MtbWorkoutBuilder.test.tsx`
- Modify: `src/components/PlanScreen.tsx`

**Interfaces:**
- Produces: downloadable `garmin-mtb-workout.json`

- [x] Allow template, date, name, warmup, work, repeats, recovery, and cooldown adjustments.
- [x] Show local bridge push command.

### Task 3: Python Bridge Input

**Files:**
- Modify: `tools/garmin_bridge_push_workout.py`
- Modify: `docs/garmin-workout-push.md`

**Interfaces:**
- Consumes: `--input garmin-mtb-workout.json`

- [x] Dry-run app-generated workout JSON.
- [x] Push app-generated workout JSON only with `--push`.

### Task 4: Verify

**Files:**
- All changed files.

**Interfaces:**
- Produces: pushed branch update.

- [ ] Run focused tests.
- [ ] Run full test/build/audit.
