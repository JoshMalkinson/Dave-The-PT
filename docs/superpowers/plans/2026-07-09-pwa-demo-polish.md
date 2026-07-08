# PWA Demo Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MVP website feel closer to an installable mobile app for demos.

**Architecture:** Keep PWA behavior in a small registration helper and a static service worker served from `public`. Preserve the existing React app shell and adjust CSS only where mobile ergonomics need it.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, browser Service Worker API, Web App Manifest.

## Global Constraints

- Do not add a PWA plugin unless manual registration becomes too complex.
- The app must still run normally in browsers without service worker support.
- Keep offline behavior conservative: cache the app shell and same-origin static assets only.
- Keep mobile UI touch targets stable and readable.

---

### Task 1: Install Metadata

**Files:**
- Modify: `public/manifest.webmanifest`
- Modify: `index.html`

**Interfaces:**
- Produces: Dave The PT install name, app metadata, mobile web app tags.

- [ ] Rename manifest from Adaptive Coach to Dave The PT.
- [ ] Add install-related metadata to `index.html`.

### Task 2: Service Worker Registration

**Files:**
- Create: `src/pwa/registerServiceWorker.ts`
- Create: `src/pwa/registerServiceWorker.test.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `registerServiceWorker(windowLike?: Window): void`
- Consumes: `window.navigator.serviceWorker.register`

- [ ] Test unsupported browsers do nothing.
- [ ] Test supported browsers register `/service-worker.js`.
- [ ] Call the helper during app startup.

### Task 3: Offline App Shell

**Files:**
- Create: `public/service-worker.js`

**Interfaces:**
- Produces: install, activate, and fetch handlers for app shell caching.

- [ ] Cache `/`, `/index.html`, `/manifest.webmanifest`, and `/icon.svg` on install.
- [ ] Delete stale `dave-the-pt-*` caches on activate.
- [ ] Return cached shell for same-origin navigation when network fails.

### Task 4: Mobile Shell Polish

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: fixed mobile bottom nav, safe-area padding, and stable compact auth row.

- [ ] Add safe-area aware padding for mobile.
- [ ] Fix bottom nav to the bottom edge on mobile.
- [ ] Keep auth controls stacked on narrow screens.

### Task 5: Verify and Publish

**Files:**
- All changed files.

**Interfaces:**
- Produces: merged PR into `codex/mvp`.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd audit --audit-level=moderate`.
- [ ] Commit, push, create PR, and merge when checks are green.
