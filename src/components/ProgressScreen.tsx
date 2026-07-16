import { BarChart3 } from "lucide-react";
import {
  buildGarminReportMetrics,
  type GarminInsight,
  type GarminReportData,
} from "../integrations/garmin/garminReport";

interface ProgressScreenProps {
  garminReport?: GarminReportData;
  garminInsights: GarminInsight[];
}

export function ProgressScreen({
  garminInsights,
  garminReport,
}: ProgressScreenProps) {
  const garminMetrics = garminReport ? buildGarminReportMetrics(garminReport) : [];

  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Garmin-style Signals</p>
        <h1>Progress</h1>
        <p>
          Garmin bridge imports and live weather refreshes drive the current
          recovery and training report.
        </p>
      </section>

      {!garminReport && (
        <section className="content-panel">
          <div className="section-heading">
            <BarChart3 size={20} aria-hidden="true" />
            <h2>Garmin Data Required</h2>
          </div>
          <p className="coach-copy">
            Import a Garmin bridge export from Setup to populate recovery,
            activity, stress, body battery, and training report metrics.
          </p>
        </section>
      )}

      {garminReport && (
        <section className="content-panel">
          <div className="section-heading">
            <BarChart3 size={20} aria-hidden="true" />
            <h2>Garmin Report</h2>
          </div>
          <div className="progress-grid compact-report-grid" aria-label="Garmin report metrics">
            {garminMetrics.map((metric) => (
              <article className={`progress-card ${metric.tone}`} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.change}</p>
              </article>
            ))}
          </div>
          <div className="activity-list" aria-label="Garmin activity summaries">
            {garminReport.activities.slice(0, 8).map((activity) => (
              <div key={activity.id}>
                <span>{activity.date}</span>
                <strong>{activity.name}</strong>
                <small>
                  {(activity.distanceMeters / 1000).toFixed(1)} km ·{" "}
                  {(activity.durationSeconds / 60).toFixed(0)} min · TE{" "}
                  {activity.trainingEffect.toFixed(1)}
                </small>
              </div>
            ))}
          </div>
          <div className="insight-list report-insights" aria-label="Garmin coaching insights">
            {garminInsights.map((insight) => (
              <article className={`insight-card ${insight.tone}`} key={insight.title}>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
