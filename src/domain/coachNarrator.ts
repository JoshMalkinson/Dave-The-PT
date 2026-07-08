import type { DailyRecommendation } from "./types";

function trimToWordLimit(text: string, limit: number): string {
  const words = text.split(/\s+/);
  if (words.length <= limit) {
    return text;
  }

  return `${words.slice(0, limit - 1).join(" ")}.`;
}

export function explainRecommendation(recommendation: DailyRecommendation): string {
  const reason = recommendation.reasons[0];
  const riskCopy =
    recommendation.weatherScore.risks.length > 0
      ? `Weather risk: ${recommendation.weatherScore.risks.join(", ")}.`
      : "Weather is supporting the session.";

  const copy = [
    `${recommendation.workout.title} is scheduled for ${recommendation.scheduledWindow}.`,
    reason,
    `${riskCopy} Readiness is ${recommendation.readinessScore}%, with ${recommendation.daysUntilRace} days until race day.`,
    "The engine is keeping the plan explainable and inside your recovery guardrails.",
  ].join(" ");

  return trimToWordLimit(copy, 120);
}
