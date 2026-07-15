# Garmin Connect Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only Garmin Connect bridge importer/exporter for demo data while official Garmin API approval is pending.

**Architecture:** Keep Garmin credentials outside the web app. A Python tool exports a validated JSON payload; the React app imports that payload and reuses the existing `GarminDailyImport` mapper.

**Tech Stack:** React, TypeScript, Vitest, Python 3, optional `garminconnect` Python package.

## Global Constraints

- Do not put Garmin credentials in frontend code.
- Do not commit Garmin token files or generated bridge exports.
- Keep the official Garmin API path as the long-term production path.

---

### Task 1: Bridge JSON Parser

**Files:**
- Create: `src/integrations/garmin/garminBridgeImport.ts`
- Create: `src/integrations/garmin/garminBridgeImport.test.ts`

**Interfaces:**
- Produces: `parseGarminBridgeImportJson(jsonText: string): GarminDailyImport`

- [ ] Test valid bridge envelope parsing.
- [ ] Test raw `GarminDailyImport` parsing.
- [ ] Test invalid JSON and invalid numeric/status fields.

### Task 2: Setup File Import

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/SetupScreen.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: bridge JSON file selected by the user.
- Produces: imported Garmin metrics in the dashboard.

- [ ] Add UI test for importing a bridge JSON file.
- [ ] Add file input and app handler.

### Task 3: Local Python Exporter

**Files:**
- Create: `tools/garmin_bridge_export.py`
- Create: `tools/garmin_bridge_requirements.txt`
- Create: `docs/garmin-bridge.md`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Produces: `garmin-bridge-export.json`.

- [ ] Add a local exporter that reads `GARMIN_EMAIL`, prompts for password/MFA when needed, and writes bridge JSON.
- [ ] Document setup and warnings.

### Task 4: Verify and Publish

**Files:**
- All changed files.

**Interfaces:**
- Produces: pushed branch and PR.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
