# Garmin Connect Bridge Design

## Goal

Use `cyberjunky/python-garminconnect` as a temporary local bridge while waiting for official Garmin developer approval, without adding a public user-facing Garmin password flow.

## Approach

The bridge is local-only. A script in `tools/` logs into Garmin Connect using credentials supplied in the developer's terminal environment, pulls daily wellness/activity summary data, maps it into the existing `GarminDailyImport` shape, and writes a JSON export. Dave The PT imports that JSON file from Setup and applies it through the existing Garmin mapper.

The official Garmin integration remains the target architecture. This bridge does not define the product-facing account connection model; it only produces the same import contract that the future official Garmin API sync will produce.

## Boundaries

- Garmin credentials must never enter the React app.
- Garmin credentials and tokens must never be committed.
- The bridge is for owner/developer demo use only.
- The official Garmin OAuth/API path remains the production target.
- No UI copy should imply that this bridge is the final Garmin sign-in experience.

## Official Garmin Path

When Garmin approves API access, the app should replace the local bridge with:

1. A `Connect Garmin` button that starts Garmin OAuth from a backend endpoint.
2. A callback endpoint that exchanges the authorization code for tokens server-side.
3. Secure Supabase storage for Garmin connection metadata and encrypted refresh tokens.
4. A scheduled or on-demand sync job that maps official Health API and Activity API responses into the same `GarminDailyImport` and snapshot table contracts.
5. A disconnect action that revokes or removes the connection and stops sync.

## App Flow

1. Run the local bridge exporter.
2. Select the generated JSON file in Setup.
3. The app validates the JSON shape.
4. The app applies the import and persists the updated plan data through the current repository.

## Implementation Units

- `src/integrations/garmin/garminBridgeImport.ts`: validates bridge JSON and returns `GarminDailyImport`.
- `SetupScreen`: adds a file input for bridge JSON.
- `App`: reads the selected file, parses it, applies Garmin import, and reports status.
- `tools/garmin_bridge_export.py`: local-only exporter using `garminconnect`.
- `docs/garmin-bridge.md`: setup and safety instructions.
