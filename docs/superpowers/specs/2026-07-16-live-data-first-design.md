# Live Data First Design

## Goal

Stop presenting seeded/demo values as if they are current athlete data. Visible recovery, activity reporting, and weather context should come from Garmin bridge imports and Open-Meteo refreshes.

## Approach

- Remove the demo Garmin import action from Setup.
- Keep Garmin import through bridge/API-shaped JSON only.
- Show an explicit Garmin data required state on Progress before a Garmin report is imported.
- Hide seed-backed progress cards and training load chart.
- Refresh weather from Open-Meteo automatically in normal app runs and keep manual refresh available.

## Remaining Bootstrap Data

The app still needs local bootstrap data for first render, tests, race setup, and workout templates. That bootstrap data should not be presented as real Garmin reporting.
