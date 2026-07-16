# MTB Workout Builder Design

## Goal

Let the user adjust mountain bike workouts inside Dave The PT, then export a bridge file that can be dry-run or pushed to Garmin locally.

## Approach

Add a Plan screen builder for MTB workout templates. The builder creates a Garmin cycling workout payload because the unofficial Garmin bridge exposes typed cycling workouts, not a distinct mountain bike workout type. The exported JSON contains the Garmin payload and schedule date. The Python bridge can read that exact JSON with `--input`.

## Safety

- The app never receives Garmin credentials.
- The app only downloads a local JSON bridge file.
- The Python bridge remains dry-run by default and writes to Garmin only with `--push`.
- The future official Garmin Training API should consume the same payload-building contract.
