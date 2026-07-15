import { BarChart3 } from "lucide-react";
import type { ProgressMetric, TrendPoint } from "../data/seedData";
import {
  buildGarminReportMetrics,
  type GarminInsight,
  type GarminReportData,
} from "../integrations/garmin/garminReport";

interface ProgressScreenProps {
  garminReport?: GarminReportData;
  garminInsights: GarminInsight[];
  metrics: ProgressMetric[];
  trendData: TrendPoint[];
}

export function ProgressScreen({
  garminInsights,
  garminReport,
  metrics,
  trendData,
}: ProgressScreenProps) {
  const maxLoad = Math.max(...trendData.map((point) => point.load));
  const garminMetrics = garminReport ? buildGarminReportMetrics(garminReport) : [];

  return (
    <div className="screen-stack">
      <section className="screen-header">
        <p className="eyebrow">Garmin-style Signals</p>
        <h1>Progress</h1>
        <p>
          Seeded metrics show the kind of recovery and training-load context the
          engine will eventually sync from Garmin.
        </p>
      </section>

      <section className="progress-grid" aria-label="Progress metrics">
        {metrics.map((metric) => (
          <article className={`progress-card ${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.change}</p>
          </article>
        ))}
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <BarChart3 size={20} aria-hidden="true" />
          <h2>Training Load Trend</h2>
        </div>
        <div className="trend-chart" aria-label="Weekly training load bars">
          {trendData.map((point) => (
            <div className="trend-column" key={point.label}>
              <span
                className="trend-bar"
                style={{ height: `${Math.max(18, (point.load / maxLoad) * 100)}%` }}
              />
              <small>{point.label}</small>
            </div>
          ))}
        </div>
      </section>

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
