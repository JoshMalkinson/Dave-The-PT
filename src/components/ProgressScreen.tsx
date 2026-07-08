import { BarChart3 } from "lucide-react";
import type { ProgressMetric, TrendPoint } from "../data/seedData";

interface ProgressScreenProps {
  metrics: ProgressMetric[];
  trendData: TrendPoint[];
}

export function ProgressScreen({ metrics, trendData }: ProgressScreenProps) {
  const maxLoad = Math.max(...trendData.map((point) => point.load));

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
    </div>
  );
}
