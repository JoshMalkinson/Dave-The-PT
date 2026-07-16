import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoPlanInput } from "../data/seedData";
import { buildAdaptiveWeek } from "../domain/trainingEngine";
import { MtbWeeklyPlanner } from "./MtbWeeklyPlanner";

describe("MtbWeeklyPlanner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a selected workout detail and recalculates adjusted duration", async () => {
    const user = userEvent.setup();
    render(<MtbWeeklyPlanner week={buildAdaptiveWeek(demoPlanInput)} />);

    await user.click(screen.getByRole("tab", { name: /Tuesday/ }));

    expect(screen.getByRole("heading", { name: /Climb Threshold Repeats/ })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Repeat count"));
    await user.type(screen.getByLabelText("Repeat count"), "6");

    expect(screen.getByText("57 min")).toBeInTheDocument();
  });

  it("downloads a weekly bridge sync file for all scheduled MTB workouts", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mtb-week");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<MtbWeeklyPlanner week={buildAdaptiveWeek(demoPlanInput)} />);
    await user.click(screen.getByRole("button", { name: "Download week sync" }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });

  it("syncs the workout week through the local Garmin bridge service", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Synced 4 MTB workouts.",
        workoutsSynced: 4,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MtbWeeklyPlanner week={buildAdaptiveWeek(demoPlanInput)} />);
    await user.click(screen.getByRole("button", { name: "Sync week to Garmin" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8765/sync/week",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(await screen.findByText("Synced 4 MTB workouts.")).toBeInTheDocument();
  });
});
