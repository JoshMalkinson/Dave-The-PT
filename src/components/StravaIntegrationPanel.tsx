import { Bike, ExternalLink } from "lucide-react";

interface StravaIntegrationPanelProps {
  clientId?: string;
  isSignedIn: boolean;
  status: string;
  onConnect: () => void;
}

export function StravaIntegrationPanel({
  clientId,
  isSignedIn,
  status,
  onConnect,
}: StravaIntegrationPanelProps) {
  const isConfigured = Boolean(clientId);

  return (
    <article className="content-panel integration-panel">
      <div className="section-heading">
        <Bike size={20} aria-hidden="true" />
        <h2>Strava Ride History</h2>
      </div>
      <dl className="detail-list compact">
        <div>
          <dt>Purpose</dt>
          <dd>Distance, speed, climbing, HR and power targets</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>Recent cycling and MountainBikeRide activities</dd>
        </div>
      </dl>
      {!isConfigured && (
        <p className="integration-note">
          Set VITE_STRAVA_CLIENT_ID after creating a Strava API app.
        </p>
      )}
      {isConfigured && !isSignedIn && (
        <p className="integration-note">Sign into Supabase before connecting Strava.</p>
      )}
      {status && <p className="integration-note">{status}</p>}
      <button
        type="button"
        className="primary-action full-width-action"
        onClick={onConnect}
      >
        <ExternalLink size={18} aria-hidden="true" />
        Connect Strava
      </button>
    </article>
  );
}
