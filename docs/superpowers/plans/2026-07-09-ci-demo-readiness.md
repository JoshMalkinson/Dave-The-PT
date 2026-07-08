# CI Demo Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MVP easier to review and safer to keep iterating by adding CI and local demo documentation.

**Architecture:** Use a standard GitHub Actions workflow that mirrors local verification. Keep human-facing setup and demo notes in the root README.

**Tech Stack:** GitHub Actions, Node.js 22, npm, Vite, Vitest, Supabase CLI via project dev dependency.

## Global Constraints

- CI must not require Supabase secrets.
- README must not contain private tokens or database passwords.
- Commands in README must work from the repository root.

---

### Task 1: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: CI on pull requests and pushes to `codex/mvp`.

- [ ] Run `npm ci`.
- [ ] Run `npm.cmd test -- --run` equivalent as `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run `npm audit --audit-level=moderate`.

### Task 2: README Demo Guide

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: local run instructions, verification commands, Supabase setup pointer, and MVP status.

- [ ] Document local demo mode.
- [ ] Document Supabase env vars and setup docs.
- [ ] Document verification commands.
- [ ] Document current integration status for weather and Garmin.

### Task 3: Verify and Publish

**Files:**
- All changed files.

**Interfaces:**
- Produces: merged PR into `codex/mvp`.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Commit, push, create PR, and merge when checks are green.
