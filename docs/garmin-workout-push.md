# Garmin MTB Workout Push Bridge

This is a local-only bridge for pushing mountain bike workouts to Garmin while official Garmin Training API access is pending.

## App Button Sync

Start the local bridge service before using the Plan screen's `Sync week to Garmin` button:

```bash
python tools/garmin_workout_bridge_service.py
```

That runs in dry-run mode and confirms the app can reach the bridge without writing to Garmin. For actual watch sync, start it with:

```bash
python tools/garmin_workout_bridge_service.py --push
```

The app sends the current week to `http://127.0.0.1:8765/sync/week`. The service uses the same local Garmin token cache as the CLI bridge.

## CLI Fallback

By default the script is a dry run and prints the Garmin cycling workout payload:

```bash
python tools/garmin_bridge_push_workout.py --workout mtb-climb-repeats-50 --date 2026-07-17
```

To actually upload to Garmin, add `--push`:

```bash
python tools/garmin_bridge_push_workout.py --workout mtb-climb-repeats-50 --date 2026-07-17 --push
```

The app can also export an adjusted workout from the Plan screen. Dry-run that exact file with:

```bash
python tools/garmin_bridge_push_workout.py --input garmin-mtb-workout.json
```

The Plan screen can export the whole week for daily watch scheduling:

```bash
python tools/garmin_bridge_push_workout.py --input-week garmin-mtb-week.json
```

Upload the adjusted app export with:

```bash
python tools/garmin_bridge_push_workout.py --input garmin-mtb-workout.json --push
```

Available MTB templates:

- `mtb-aerobic-45`
- `mtb-climb-repeats-50`
- `mtb-tempo-55`
- `mtb-recovery-40`

The bridge uses Garmin's cycling workout channel because the unofficial library exposes typed cycling workouts, not a distinct mountain bike workout type. The official Garmin Training API should replace this bridge for production users.

## Workout Sources

The sub-hour MTB templates are adapted from current cycling and MTB training guidance:

- Aerobic rides stay mostly low intensity, using the 30 to 60 minute quality-session principle described by TrainingPeaks.
- Climb repeats follow the MTB cross-country threshold structure of 5 to 8 repeats of 3 to 4 minutes with short recoveries.
- Tempo rides use sweet-spot work below threshold, similar to MTB winter-training examples.
- Hill charges use short standing/seated climb efforts as a climbing-specific power workout.

## Strava Personalization Next

Strava can help personalize distance and speed targets once users connect their account through OAuth. The useful MTB fields are recent ride distance, moving time, average speed, elevation gain, heart rate, power when present, and activity sport type. Those should feed rider-specific targets such as expected kilometers, vertical meters, climb rate, and HR/power bands rather than generic running pace.
