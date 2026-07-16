# Garmin Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add coaching insights derived from Garmin report data.

**Architecture:** Add pure insight logic in `src/integrations/garmin/garminReport.ts`, then pass insights from `App` to Home and Progress.

**Tech Stack:** React, TypeScript, Vitest.

## Global Constraints

- Insights must depend on `GarminReportData`, not directly on bridge JSON.
- Home should remain useful when no Garmin report exists.
- Keep copy concise and coaching-oriented.

---

### Task 1: Insight Builder

**Files:**
- Modify: `src/integrations/garmin/garminReport.ts`
- Modify: `src/integrations/garmin/garminReport.test.ts`

**Interfaces:**
- Produces: `buildGarminInsights(report: GarminReportData): GarminInsight[]`

- [x] Add failing tests for recovery, sleep, and consistency insights.
- [x] Implement insight builder.

### Task 2: Surface Insights

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/HomeScreen.tsx`
- Modify: `src/components/ProgressScreen.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `GarminInsight[]`

- [x] Show Garmin insights on Home after bridge import.
- [x] Show Garmin insights in the Progress report section.

### Task 3: Verify and Publish

**Files:**
- All changed files.

**Interfaces:**
- Produces: pushed branch and PR.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
