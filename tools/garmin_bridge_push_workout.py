from __future__ import annotations

import argparse
import getpass
import json
import os
from pathlib import Path
from typing import Any


MTB_TEMPLATES = {
    "mtb-endurance-75": {
        "name": "Dave MTB Endurance 75",
        "description": "Steady aerobic mountain bike endurance ride.",
        "steps": [
            ("warmup", 10 * 60),
            ("interval", 55 * 60),
            ("cooldown", 10 * 60),
        ],
    },
    "mtb-hill-repeats-60": {
        "name": "Dave MTB Hill Repeats 60",
        "description": "Trail climb repeats with easy roll-down recoveries.",
        "steps": [
            ("warmup", 12 * 60),
            ("repeat", 5, [("interval", 4 * 60), ("recovery", 3 * 60)]),
            ("cooldown", 13 * 60),
        ],
    },
    "mtb-tempo-90": {
        "name": "Dave MTB Tempo Trail 90",
        "description": "Progressive tempo-focused mountain bike ride.",
        "steps": [
            ("warmup", 15 * 60),
            ("interval", 3 * 20 * 60),
            ("cooldown", 15 * 60),
        ],
    },
    "mtb-recovery-45": {
        "name": "Dave MTB Recovery Spin 45",
        "description": "Easy recovery spin, keep pressure low.",
        "steps": [
            ("warmup", 5 * 60),
            ("recovery", 35 * 60),
            ("cooldown", 5 * 60),
        ],
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Dry-run or push a Dave The PT mountain bike workout to Garmin."
    )
    parser.add_argument(
        "--workout",
        default="mtb-endurance-75",
        choices=sorted(MTB_TEMPLATES),
        help="MTB workout template to build",
    )
    parser.add_argument("--date", help="Optional schedule date, YYYY-MM-DD")
    parser.add_argument("--push", action="store_true", help="Actually upload to Garmin")
    parser.add_argument(
        "--tokenstore",
        default=str(Path.home() / ".garminconnect"),
        help="Local token cache directory used by python-garminconnect",
    )
    return parser.parse_args()


def login(tokenstore: str) -> Any:
    from garminconnect import Garmin

    if Path(tokenstore).expanduser().exists():
        cached_client = Garmin()
        try:
            cached_client.login(tokenstore)
            print(f"Using cached Garmin tokens from {tokenstore}")
            return cached_client
        except Exception as error:
            print(f"Cached Garmin token login failed: {error}")

    email = os.getenv("GARMIN_EMAIL") or input("Garmin email: ").strip()
    password = os.getenv("GARMIN_PASSWORD") or getpass.getpass("Garmin password: ")
    client = Garmin(email, password, prompt_mfa=lambda: input("Garmin MFA code: ").strip())
    client.login(tokenstore)
    return client


def step_factory(kind: str, duration_seconds: int, step_order: int) -> Any:
    from garminconnect.workout import (
        create_cooldown_step,
        create_interval_step,
        create_recovery_step,
        create_warmup_step,
    )

    if kind == "warmup":
        return create_warmup_step(float(duration_seconds), step_order)
    if kind == "interval":
        return create_interval_step(float(duration_seconds), step_order)
    if kind == "recovery":
        return create_recovery_step(float(duration_seconds), step_order)
    if kind == "cooldown":
        return create_cooldown_step(float(duration_seconds), step_order)

    raise ValueError(f"Unsupported step kind: {kind}")


def build_workout(template_id: str) -> Any:
    from garminconnect.workout import CyclingWorkout, WorkoutSegment, create_repeat_group

    template = MTB_TEMPLATES[template_id]
    workout_steps = []
    step_order = 1

    for step in template["steps"]:
      kind = step[0]
      if kind == "repeat":
          iterations = int(step[1])
          child_steps = []
          child_order = 1
          for child_kind, child_duration in step[2]:
              child_steps.append(step_factory(child_kind, child_duration, child_order))
              child_order += 1
          workout_steps.append(create_repeat_group(iterations, child_steps, step_order))
      else:
          workout_steps.append(step_factory(kind, int(step[1]), step_order))
      step_order += 1

    total_seconds = estimate_duration_seconds(template["steps"])
    return CyclingWorkout(
        workoutName=template["name"],
        description=template["description"],
        estimatedDurationInSecs=total_seconds,
        workoutSegments=[
            WorkoutSegment(
                segmentOrder=1,
                sportType={"sportTypeId": 2, "sportTypeKey": "cycling", "displayOrder": 2},
                workoutSteps=workout_steps,
            )
        ],
    )


def estimate_duration_seconds(steps: list[Any]) -> int:
    total = 0
    for step in steps:
        if step[0] == "repeat":
            total += int(step[1]) * sum(int(child[1]) for child in step[2])
        else:
            total += int(step[1])
    return total


def main() -> int:
    args = parse_args()
    workout = build_workout(args.workout)
    payload = workout.to_dict()

    if not args.push:
        print(json.dumps(payload, indent=2))
        print("\nDry run only. Add --push to upload this MTB workout to Garmin.")
        return 0

    client = login(args.tokenstore)
    uploaded = client.upload_cycling_workout(workout)
    print(json.dumps(uploaded, indent=2))

    workout_id = uploaded.get("workoutId") or uploaded.get("id")
    if args.date and workout_id:
        scheduled = client.schedule_workout(workout_id, args.date)
        print(json.dumps(scheduled, indent=2))
    elif args.date:
        print("Uploaded workout, but no workout id was returned to schedule.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
