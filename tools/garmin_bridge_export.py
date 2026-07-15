from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export a local Garmin Connect bridge JSON file for Dave The PT."
    )
    parser.add_argument("--date", default=date.today().isoformat(), help="Date to export, YYYY-MM-DD")
    parser.add_argument(
        "--output",
        default="garmin-bridge-export.json",
        help="Output JSON path",
    )
    parser.add_argument(
        "--tokenstore",
        default=str(Path.home() / ".garminconnect"),
        help="Local token cache directory used by python-garminconnect",
    )
    return parser.parse_args()


def deep_values(payload: Any, key_names: set[str]) -> list[Any]:
    values: list[Any] = []
    if isinstance(payload, dict):
        for key, value in payload.items():
            if key in key_names:
                values.append(value)
            values.extend(deep_values(value, key_names))
    elif isinstance(payload, list):
        for item in payload:
            values.extend(deep_values(item, key_names))
    return values


def first_number(payloads: list[Any], keys: list[str], default: float) -> float:
    key_set = set(keys)
    for payload in payloads:
        for value in deep_values(payload, key_set):
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                try:
                    return float(value)
                except ValueError:
                    pass
    return default


def clamp(value: float, minimum: int, maximum: int) -> int:
    return max(minimum, min(maximum, round(value)))


def hrv_status(hrv_score: float) -> str:
    if hrv_score < 45:
        return "low"
    if hrv_score > 75:
        return "high"
    return "balanced"


def safe_call(client: Any, method_name: str, *args: Any) -> Any:
    method = getattr(client, method_name, None)
    if not callable(method):
        return None
    try:
        return method(*args)
    except Exception as error:
        print(f"Warning: {method_name} failed: {error}", file=sys.stderr)
        return None


def login(tokenstore: str) -> Any:
    try:
        from garminconnect import Garmin
    except ImportError as error:
        raise SystemExit(
            "Missing dependency. Run: pip install -r tools/garmin_bridge_requirements.txt"
        ) from error

    email = os.getenv("GARMIN_EMAIL") or input("Garmin email: ").strip()
    password = os.getenv("GARMIN_PASSWORD") or getpass.getpass("Garmin password: ")
    client = Garmin(email, password, prompt_mfa=lambda: input("Garmin MFA code: ").strip())
    client.login(tokenstore)
    return client


def export_bridge(client: Any, export_date: str) -> dict[str, Any]:
    parsed_date = date.fromisoformat(export_date)
    start = (parsed_date - timedelta(days=5)).isoformat()

    stats = safe_call(client, "get_stats", export_date) or {}
    heart_rates = safe_call(client, "get_heart_rates", export_date) or {}
    sleep = safe_call(client, "get_sleep_data", export_date) or {}
    hrv = safe_call(client, "get_hrv_data", export_date) or {}
    readiness = safe_call(client, "get_training_readiness", export_date) or {}
    activities = safe_call(client, "get_activities_by_date", start, export_date) or []

    payloads = [readiness, stats, heart_rates, sleep, hrv, activities]
    sleep_seconds = first_number(
        payloads,
        ["sleepTimeSeconds", "totalSleepSeconds", "sleepSeconds", "durationInSeconds"],
        7 * 3600,
    )
    hrv_score = first_number(payloads, ["hrvScore", "lastNightAvg", "weeklyAvg", "hrvValue"], 60)
    recovery_score = first_number(
        payloads,
        ["trainingReadinessScore", "recoveryScore", "bodyBatteryMostRecentValue"],
        (min(100, sleep_seconds / 360) + hrv_score) / 2,
    )
    weekly_load = first_number(
        payloads,
        ["acuteTrainingLoad", "weeklyLoad", "trainingLoad", "load", "activityTrainingLoad"],
        0,
    )
    vo2_max = first_number(payloads, ["vo2MaxValue", "generic", "vo2Max"], 0)
    resting_hr = first_number(payloads, ["restingHeartRate", "restingHR"], 0)

    hard_workouts = 0
    if isinstance(activities, list):
        for activity in activities:
            effort = first_number([activity], ["aerobicTrainingEffect", "trainingEffect"], 0)
            if effort >= 3:
                hard_workouts += 1

    daily_import = {
        "label": parsed_date.strftime("%b %d"),
        "recoveryScore": clamp(recovery_score, 0, 100),
        "sleepSeconds": clamp(sleep_seconds, 0, 24 * 3600),
        "hrvStatus": hrv_status(hrv_score),
        "hrvScore": clamp(hrv_score, 0, 100),
        "hardWorkoutsLastFiveDays": hard_workouts,
        "weeklyLoad": round(weekly_load),
        "vo2Max": round(vo2_max, 1),
        "restingHeartRate": round(resting_hr),
    }

    return {
        "schemaVersion": 1,
        "source": "python-garminconnect",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "date": export_date,
        "dailyImport": daily_import,
    }


def main() -> int:
    args = parse_args()
    client = login(args.tokenstore)
    bridge = export_bridge(client, args.date)

    output_path = Path(args.output)
    output_path.write_text(json.dumps(bridge, indent=2), encoding="utf-8")
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
