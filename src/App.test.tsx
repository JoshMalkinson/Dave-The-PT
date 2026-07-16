import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders the home dashboard by default", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Today's Mission" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Coach's Explanation")).toBeInTheDocument();
  });

  it("navigates between the four MVP screens", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.getByRole("heading", { name: "Adaptive Week" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Progress" }));
    expect(screen.getByRole("heading", { name: "Progress" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Setup" }));
    expect(screen.getByRole("heading", { name: "Setup" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("heading", { name: "Today's Mission" })).toBeInTheDocument();
  });

  it("saves setup edits and recalculates the visible readiness", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Setup" }));
    await user.clear(screen.getByLabelText("Race name"));
    await user.type(screen.getByLabelText("Race name"), "Joburg 10K");
    await user.click(screen.getByRole("button", { name: "Low HRV" }));
    await user.click(screen.getByRole("button", { name: "Save setup" }));
    await user.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByText("Joburg 10K")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
  });

  it("imports Garmin bridge JSON into the dashboard", async () => {
    const user = userEvent.setup();
    const bridgeFile = new File(
      [
        JSON.stringify({
          schemaVersion: 1,
          source: "python-garminconnect",
          dailyImport: {
            label: "Bridge",
            recoveryScore: 83,
            sleepSeconds: 28_800,
            hrvStatus: "high",
            hrvScore: 84,
            hardWorkoutsLastFiveDays: 0,
            weeklyLoad: 430,
            vo2Max: 53.2,
            restingHeartRate: 47,
          },
          reportData: {
            windowDays: 14,
            days: [
              {
                date: "2026-07-15",
                sleepSeconds: 28_800,
                hrvScore: 84,
                restingHeartRate: 47,
                stressAverage: 30,
                bodyBatteryMin: 20,
                bodyBatteryMax: 90,
                steps: 12_000,
              },
            ],
            activities: [
              {
                id: "activity-1",
                date: "2026-07-15",
                name: "Morning Run",
                type: "running",
                distanceMeters: 8600,
                durationSeconds: 2820,
                averageHeartRate: 145,
                trainingEffect: 3.1,
              },
            ],
          },
        }),
      ],
      "garmin-bridge-export.json",
      { type: "application/json" },
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Setup" }));
    await user.upload(screen.getByLabelText("Garmin bridge JSON"), bridgeFile);
    await user.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByLabelText("Readiness 83%")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Progress" }));
    expect(screen.getByRole("heading", { name: "Garmin Report" })).toBeInTheDocument();
    expect(screen.getByText("Morning Run")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("heading", { name: "Garmin Insights" })).toBeInTheDocument();
  });

  it("does not present seeded progress as Garmin data before import", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Progress" }));

    expect(screen.getByRole("heading", { name: "Garmin Data Required" })).toBeInTheDocument();
    expect(screen.queryByText("Weekly load")).not.toBeInTheDocument();
  });

  it("refreshes weather from Open-Meteo and updates the plan", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: {
            time: ["2026-07-08"],
            temperature_2m_max: [36],
            temperature_2m_min: [22],
            precipitation_probability_max: [5],
            wind_speed_10m_max: [12],
            uv_index_max: [8],
            sunrise: ["2026-07-08T06:42"],
            sunset: ["2026-07-08T17:39"],
          },
          hourly: {
            time: ["2026-07-08T06:00", "2026-07-08T18:00"],
            temperature_2m: [35, 24],
            relative_humidity_2m: [70, 62],
            precipitation_probability: [5, 5],
          },
        }),
      }),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Setup" }));
    await user.click(screen.getByRole("button", { name: "Refresh live weather" }));
    await user.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByText("poor")).toBeInTheDocument();
  });
});
