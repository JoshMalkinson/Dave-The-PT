from __future__ import annotations

import argparse
import getpass
import json
import os
from pathlib import Path
from typing import Any


MTB_TEMPLATES = {
    "mtb-aerobic-45": {
        "name": "Dave MTB Aerobic Spin 45",
        "description": "Steady zone 2 aerobic mountain bike ride.",
        "steps": [
            ("warmup", 10 * 60),
            ("interval", 30 * 60),
            ("cooldown", 5 * 60),
        ],
    },
    "mtb-climb-repeats-50": {
        "name": "Dave MTB Climb Repeats 50",
        "description": "Threshold-focused trail climb repeats with easy roll-down recoveries.",
        "steps": [
            ("warmup", 10 * 60),
            ("repeat", 5, [("interval", 4 * 60), ("recovery", 3 * 60)]),
            ("cooldown", 5 * 60),
        ],
    },
    "mtb-tempo-55": {
        "name": "Dave MTB Tempo Trail 55",
        "description": "Sweet-spot tempo mountain bike ride for sustained trail pressure.",
        "steps": [
            ("warmup", 10 * 60),
            ("repeat", 2, [("interval", 13 * 60), ("recovery", 5 * 60)]),
            ("cooldown", 9 * 60),
        ],
    },
    "mtb-recovery-40": {
        "name": "Dave MTB Recovery Spin 40",
        "description": "Easy recovery spin, keep pressure low.",
        "steps": [
            ("warmup", 5 * 60),
            ("recovery", 30 * 60),
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
        default="mtb-aerobic-45",
        choices=sorted(MTB_TEMPLATES),
        help="MTB workout template to build",
    )
    parser.add_argument("--input", help="Bridge workout JSON exported from the app")
    parser.add_argument("--input-week", help="Bridge week JSON exported from the app")
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


def load_bridge_payload(input_path: str) -> tuple[dict[str, Any], str | None]:
    payload = json.loads(Path(input_path).read_text(encoding="utf-8"))
    return load_bridge_payload_from_object(payload)


def load_week_bridge_payload(input_path: str) -> list[tuple[dict[str, Any], str | None]]:
    payload = json.loads(Path(input_path).read_text(encoding="utf-8"))
    workouts = payload.get("workouts")
    if not isinstance(workouts, list):
        raise ValueError("Bridge week file must contain workouts")
    return [load_bridge_payload_from_object(workout) for workout in workouts]


def load_bridge_payload_from_object(payload: Any) -> tuple[dict[str, Any], str | None]:
    if not isinstance(payload, dict):
        raise ValueError("Bridge workout entry must be an object")
    workout_payload = payload.get("garminWorkoutPayload")
    if not isinstance(workout_payload, dict):
        raise ValueError("Bridge workout file must contain garminWorkoutPayload")
    schedule_date = payload.get("scheduleDate")
    if schedule_date is not None and not isinstance(schedule_date, str):
        raise ValueError("Bridge workout scheduleDate must be a string")
    return workout_payload, schedule_date


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
    if args.input and args.input_week:
        raise ValueError("Use --input or --input-week, not both")

    if args.input_week:
        week_payloads = load_week_bridge_payload(args.input_week)
        if not args.push:
            print(
                json.dumps(
                    [
                        {"scheduleDate": schedule_date, "garminWorkoutPayload": payload}
                        for payload, schedule_date in week_payloads
                    ],
                    indent=2,
                )
            )
            print("\nDry run only. Add --push to upload this MTB workout week to Garmin.")
            return 0

        client = login(args.tokenstore)
        for payload, schedule_date in week_payloads:
            uploaded = client.upload_workout(payload)
            print(json.dumps(uploaded, indent=2))
            workout_id = uploaded.get("workoutId") or uploaded.get("id")
            if schedule_date and workout_id:
                scheduled = client.schedule_workout(workout_id, schedule_date)
                print(json.dumps(scheduled, indent=2))
            elif schedule_date:
                print("Uploaded workout, but no workout id was returned to schedule.")
        return 0

    if args.input:
        payload, input_schedule_date = load_bridge_payload(args.input)
        schedule_date = args.date or input_schedule_date
        workout = None
    else:
        workout = build_workout(args.workout)
        payload = workout.to_dict()
        schedule_date = args.date

    if not args.push:
        print(json.dumps(payload, indent=2))
        print("\nDry run only. Add --push to upload this MTB workout to Garmin.")
        return 0

    client = login(args.tokenstore)
    uploaded = client.upload_workout(payload) if workout is None else client.upload_cycling_workout(workout)
    print(json.dumps(uploaded, indent=2))

    workout_id = uploaded.get("workoutId") or uploaded.get("id")
    if schedule_date and workout_id:
        scheduled = client.schedule_workout(workout_id, schedule_date)
        print(json.dumps(scheduled, indent=2))
    elif schedule_date:
        print("Uploaded workout, but no workout id was returned to schedule.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
