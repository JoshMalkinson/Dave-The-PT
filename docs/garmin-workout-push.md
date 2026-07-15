# Garmin MTB Workout Push Bridge

This is a local-only bridge for pushing mountain bike workouts to Garmin while official Garmin Training API access is pending.

By default the script is a dry run and prints the Garmin cycling workout payload:

```bash
python tools/garmin_bridge_push_workout.py --workout mtb-hill-repeats-60 --date 2026-07-17
```

To actually upload to Garmin, add `--push`:

```bash
python tools/garmin_bridge_push_workout.py --workout mtb-hill-repeats-60 --date 2026-07-17 --push
```

Available MTB templates:

- `mtb-endurance-75`
- `mtb-hill-repeats-60`
- `mtb-tempo-90`
- `mtb-recovery-45`

The bridge uses Garmin's cycling workout channel because the unofficial library exposes typed cycling workouts, not a distinct mountain bike workout type. The official Garmin Training API should replace this bridge for production users.
