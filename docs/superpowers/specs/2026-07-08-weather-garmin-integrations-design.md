# Weather And Garmin Integrations Design

## Product Goal

Make the app feel closer to a live demo by fetching real weather forecasts and preparing a Garmin integration seam that can accept official API data later. The app must remain demoable without Garmin API access.

## Scope

This slice includes:

- Open-Meteo forecast adapter using browser `fetch`.
- Mapping from Open-Meteo daily/hourly forecast data into existing `WeatherDay` inputs.
- Location fields in persisted `PlanData`.
- Setup action to refresh weather from the configured location.
- Garmin provider types and manual import mapper for daily metrics.
- Setup action to import a demo Garmin payload into athlete state and progress metrics.
- Tests for Open-Meteo mapping, Garmin mapping, and UI actions.

This slice does not include Garmin OAuth, Garmin webhook delivery, Supabase Edge Functions, background cron sync, or production secrets.

## Integration Strategy

Open-Meteo is client-callable for demo purposes and does not need an API key. The adapter will use latitude, longitude, and timezone from `PlanData.location`, fetch up to seven forecast days, and produce `WeatherDay[]` values for the existing training engine.

Garmin official access is approval-based, so the app gets a provider-neutral import seam first. `GarminDailyImport` maps the Garmin-like fields we need now: recovery score, sleep, HRV status, hard-session count, weekly load, VO2 max, and optional metric display values. When real Garmin access is available, the API client can produce the same import shape.

## UI Changes

Setup gains an "Integrations" panel with:

- location name
- latitude
- longitude
- refresh weather button
- import demo Garmin button
- status text for the last integration action

Home and Plan automatically reflect refreshed weather because the existing engine recalculates from `PlanData`.

## Testing Strategy

- Unit-test Open-Meteo URL construction and forecast mapping.
- Unit-test Garmin import mapping into `PlanData`.
- UI-test that clicking demo Garmin import changes Home readiness/HRV.
- UI-test that clicking refresh weather calls the injected weather client and updates the plan.

## Release Definition

The slice is complete when weather and Garmin import actions are available from Setup, all data still persists through the repository layer, and the app passes full tests, build, audit, and browser smoke checks.
