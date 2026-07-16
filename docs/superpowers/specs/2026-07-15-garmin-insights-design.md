# Garmin Insights Design

## Goal

Turn Garmin bridge report data into coaching guidance that helps the user understand what to do today.

## Approach

Use a pure `buildGarminInsights(report)` domain helper beside the Garmin report metrics. The helper reads the recent Garmin report window and emits a small list of insight cards with title, detail, and tone. Home shows the top insights beside the coach explanation, and Progress shows the full insight set near the Garmin report.

## Signals

- Recovery pressure: stress, HRV, and body battery.
- Sleep support: recent average sleep against a 7-hour target.
- Training rhythm: recent active days and training duration.

## Future Official Garmin Path

The insight builder depends only on `GarminReportData`, not on the local bridge. The official Garmin API sync should fill the same report contract so these insights continue to work when the bridge is removed.
