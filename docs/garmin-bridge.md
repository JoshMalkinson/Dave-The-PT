# Garmin Connect Bridge

This bridge is a temporary owner/developer tool while official Garmin API approval is pending. It uses the unofficial `cyberjunky/python-garminconnect` package locally to export a small JSON file that Dave The PT can import.

## Safety Rules

- Do not ask users to enter Garmin credentials into Dave The PT.
- Do not commit Garmin credentials, token stores, or bridge export files.
- Use this only for your own demo account or an account that explicitly belongs to the project.
- Keep pursuing the official Garmin Connect Developer Program integration.

## Setup

```bash
python -m venv .venv-garmin
.venv-garmin\Scripts\activate
pip install -r tools/garmin_bridge_requirements.txt
```

Set the email in your shell. You can set the password too, but the safer path is to let the script prompt for it.

```bash
$env:GARMIN_EMAIL="you@example.com"
python tools/garmin_bridge_export.py --date 2026-07-15 --output garmin-bridge-export.json
```

The script may prompt for password and MFA. It stores Garmin tokens in `~/.garminconnect` by default, which is outside the repo.

## Import

1. Open Dave The PT.
2. Go to Setup.
3. Use **Import Garmin bridge**.
4. Select `garmin-bridge-export.json`.

The app validates the JSON and maps it through the same `GarminDailyImport` contract that the official Garmin API sync will use later.

## Official Integration Target

The production Garmin path should be:

1. User clicks **Connect Garmin**.
2. Backend starts Garmin OAuth.
3. Garmin redirects to our callback.
4. Backend exchanges the code for tokens.
5. Tokens are stored securely server-side.
6. A sync job maps Garmin Health API and Activity API data into the same import contract.
7. User can disconnect Garmin from Dave The PT.
