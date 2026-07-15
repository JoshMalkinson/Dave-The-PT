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
    parser.add_argument("--days", type=int, default=14, help="Reporting window length in days")
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


def first_string(payloads: list[Any], keys: list[str], default: str) -> str:
    key_set = set(keys)
    for payload in payloads:
        for value in deep_values(payload, key_set):
            if isinstance(value, str) and value.strip():
                return value
            if isinstance(value, (int, float)):
                return str(value)
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


def collect_day_payloads(client: Any, day: str) -> dict[str, Any]:
    return {
        "stats": safe_call(client, "get_stats", day) or {},
        "heart_rates": safe_call(client, "get_heart_rates", day) or {},
        "sleep": safe_call(client, "get_sleep_data", day) or {},
        "hrv": safe_call(client, "get_hrv_data", day) or {},
        "stress": safe_call(client, "get_stress_data", day) or {},
        "body_battery": safe_call(client, "get_body_battery", day) or {},
        "readiness": safe_call(client, "get_training_readiness", day) or {},
    }


def day_summary(day: str, payloads_by_name: dict[str, Any]) -> dict[str, Any]:
    payloads = list(payloads_by_name.values())
    body_battery_values: list[float] = []
    body_battery_payload = payloads_by_name["body_battery"]
    if isinstance(body_battery_payload, list):
        for entry in body_battery_payload:
            if not isinstance(entry, dict):
                continue
            for row in entry.get("bodyBatteryValuesArray", []):
                if isinstance(row, list) and len(row) > 1 and isinstance(row[1], (int, float)):
                    body_battery_values.append(float(row[1]))

    return {
        "date": day,
        "sleepSeconds": clamp(
            first_number(
                payloads,
                [
                    "sleepingSeconds",
                    "sleepTimeSeconds",
                    "totalSleepSeconds",
                    "sleepSeconds",
                    "durationInSeconds",
                ],
                0,
            ),
            0,
            24 * 3600,
        ),
        "hrvScore": clamp(
            first_number(payloads, ["hrvScore", "lastNightAvg", "weeklyAvg", "hrvValue"], 0),
            0,
            100,
        ),
        "restingHeartRate": round(
            first_number(payloads, ["restingHeartRate", "restingHR", "restingHeartRateInBeatsPerMinute"], 0)
        ),
        "stressAverage": round(first_number(payloads, ["avgStressLevel", "averageStressLevel", "stressAvg"], 0)),
        "bodyBatteryMin": round(min(body_battery_values) if body_battery_values else 0),
        "bodyBatteryMax": round(max(body_battery_values) if body_battery_values else 0),
        "steps": round(first_number(payloads, ["totalSteps", "steps", "stepCount"], 0)),
    }


def activity_summary(activity: dict[str, Any]) -> dict[str, Any]:
    activity_id = first_string([activity], ["activityId", "id"], "unknown")
    activity_type = "activity"
    if isinstance(activity.get("activityType"), dict):
        activity_type = first_string([activity["activityType"]], ["typeKey", "activityTypeKey"], "activity")

    return {
        "id": activity_id,
        "date": first_string([activity], ["startTimeLocal", "startTimeGMT", "date"], "")[:10],
        "name": first_string([activity], ["activityName", "name"], "Garmin activity"),
        "type": activity_type,
        "distanceMeters": round(first_number([activity], ["distance", "distanceMeters"], 0)),
        "durationSeconds": round(first_number([activity], ["duration", "elapsedDuration", "movingDuration"], 0)),
        "averageHeartRate": round(first_number([activity], ["averageHR", "averageHeartRate"], 0)),
        "trainingEffect": first_number([activity], ["aerobicTrainingEffect", "trainingEffect"], 0),
    }
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

    if Path(tokenstore).expanduser().exists():
        cached_client = Garmin()
        try:
            cached_client.login(tokenstore)
            print(f"Using cached Garmin tokens from {tokenstore}")
            return cached_client
        except Exception as error:
            print(f"Cached Garmin token login failed: {error}", file=sys.stderr)

    email = os.getenv("GARMIN_EMAIL") or input("Garmin email: ").strip()
    password = os.getenv("GARMIN_PASSWORD") or getpass.getpass("Garmin password: ")
    client = Garmin(email, password, prompt_mfa=lambda: input("Garmin MFA code: ").strip())
    client.login(tokenstore)
    return client


def export_bridge(client: Any, export_date: str, window_days: int) -> dict[str, Any]:
    parsed_date = date.fromisoformat(export_date)
    bounded_window_days = max(1, min(window_days, 60))
    start = (parsed_date - timedelta(days=bounded_window_days - 1)).isoformat()

    export_day_payloads = collect_day_payloads(client, export_date)
    activities = safe_call(client, "get_activities_by_date", start, export_date) or []

    report_days = []
    for offset in range(bounded_window_days):
        day = (parsed_date - timedelta(days=bounded_window_days - 1 - offset)).isoformat()
        payloads_by_name = export_day_payloads if day == export_date else collect_day_payloads(client, day)
        report_days.append(day_summary(day, payloads_by_name))

    report_activities = [
        activity_summary(activity)
        for activity in activities
        if isinstance(activity, dict)
    ]

    payloads = [*export_day_payloads.values(), activities]
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
        "schemaVersion": 2,
        "source": "python-garminconnect",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "date": export_date,
        "dailyImport": daily_import,
        "reportData": {
            "windowDays": bounded_window_days,
            "days": report_days,
            "activities": report_activities,
        },
    }


def main() -> int:
    args = parse_args()
    client = login(args.tokenstore)
    bridge = export_bridge(client, args.date, args.days)

    output_path = Path(args.output)
    output_path.write_text(json.dumps(bridge, indent=2), encoding="utf-8")
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
