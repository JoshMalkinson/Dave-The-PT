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

  it("imports demo Garmin metrics into the dashboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Setup" }));
    await user.click(screen.getByRole("button", { name: "Import demo Garmin" }));
    await user.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByLabelText("Readiness 76%")).toBeInTheDocument();
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
