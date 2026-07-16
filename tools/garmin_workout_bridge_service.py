from __future__ import annotations

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from garmin_bridge_push_workout import load_bridge_payload_from_object, login


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Local HTTP bridge for syncing Dave The PT MTB workouts to Garmin."
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    parser.add_argument("--push", action="store_true", help="Actually upload workouts to Garmin")
    parser.add_argument(
        "--tokenstore",
        default=str(Path.home() / ".garminconnect"),
        help="Local token cache directory used by python-garminconnect",
    )
    return parser.parse_args()


def build_handler(push_enabled: bool, tokenstore: str | None) -> type[BaseHTTPRequestHandler]:
    class GarminWorkoutBridgeHandler(BaseHTTPRequestHandler):
        def _send_json(self, status: int, payload: dict[str, Any]) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.end_headers()
            self.wfile.write(body)

        def do_OPTIONS(self) -> None:
            self._send_json(200, {"ok": True})

        def do_GET(self) -> None:
            if self.path == "/health":
                self._send_json(
                    200,
                    {
                        "ok": True,
                        "message": "Local Garmin workout bridge is running.",
                        "pushEnabled": push_enabled,
                    },
                )
                return
            self._send_json(404, {"ok": False, "message": "Unknown bridge route."})

        def do_POST(self) -> None:
            if self.path != "/sync/week":
                self._send_json(404, {"ok": False, "message": "Unknown bridge route."})
                return

            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
                workouts = payload.get("workouts")
                if not isinstance(workouts, list):
                    raise ValueError("Request body must contain workouts")
                bridge_payloads = [load_bridge_payload_from_object(workout) for workout in workouts]
            except Exception as error:
                self._send_json(400, {"ok": False, "message": str(error)})
                return

            if not push_enabled:
                self._send_json(
                    200,
                    {
                        "ok": True,
                        "message": f"Dry run accepted {len(bridge_payloads)} MTB workouts.",
                        "workoutsSynced": 0,
                    },
                )
                return

            try:
                client = login(tokenstore or str(Path.home() / ".garminconnect"))
                synced = 0
                for workout_payload, schedule_date in bridge_payloads:
                    uploaded = client.upload_workout(workout_payload)
                    workout_id = uploaded.get("workoutId") or uploaded.get("id")
                    if schedule_date and workout_id:
                        client.schedule_workout(workout_id, schedule_date)
                    synced += 1
            except Exception as error:
                self._send_json(500, {"ok": False, "message": str(error)})
                return

            self._send_json(
                200,
                {
                    "ok": True,
                    "message": f"Synced {synced} MTB workouts.",
                    "workoutsSynced": synced,
                },
            )

        def log_message(self, format: str, *args: Any) -> None:
            print(f"{self.address_string()} - {format % args}")

    return GarminWorkoutBridgeHandler


def main() -> int:
    args = parse_args()
    server = ThreadingHTTPServer(
        (args.host, args.port),
        build_handler(push_enabled=args.push, tokenstore=args.tokenstore),
    )
    mode = "push" if args.push else "dry-run"
    print(f"Garmin workout bridge service running at http://{args.host}:{args.port} ({mode})")
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
