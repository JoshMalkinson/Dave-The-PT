import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MtbWorkoutBuilder } from "./MtbWorkoutBuilder";

describe("MtbWorkoutBuilder", () => {
  it("updates the estimated workout duration when repeats change", async () => {
    const user = userEvent.setup();
    render(<MtbWorkoutBuilder />);

    expect(screen.getByText("60 min")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Repeat count"));
    await user.type(screen.getByLabelText("Repeat count"), "6");

    expect(screen.getByText("67 min")).toBeInTheDocument();
  });

  it("downloads the adjusted bridge workout json", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mtb");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<MtbWorkoutBuilder />);
    await user.click(screen.getByRole("button", { name: "Download bridge workout" }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });
});
