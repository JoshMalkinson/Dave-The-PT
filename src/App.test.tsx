import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
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
});
