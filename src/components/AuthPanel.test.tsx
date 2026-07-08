import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthPanel } from "./AuthPanel";

describe("AuthPanel", () => {
  it("requests a magic link for the entered email", async () => {
    const user = userEvent.setup();
    const onSendMagicLink = vi.fn().mockResolvedValue(undefined);

    render(
      <AuthPanel
        session={{ user: null, email: null, isSignedIn: false }}
        onSendMagicLink={onSendMagicLink}
        onSignOut={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Supabase account email"), "runner@example.com");
    await user.click(screen.getByRole("button", { name: "Send magic link" }));

    expect(onSendMagicLink).toHaveBeenCalledWith("runner@example.com");
    expect(await screen.findByText("Magic link sent")).toBeInTheDocument();
  });

  it("signs out a connected account", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn().mockResolvedValue(undefined);

    render(
      <AuthPanel
        session={{
          user: { id: "user-123", email: "runner@example.com" } as never,
          email: "runner@example.com",
          isSignedIn: true,
        }}
        onSendMagicLink={vi.fn()}
        onSignOut={onSignOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(onSignOut).toHaveBeenCalled();
    expect(await screen.findByText("Signed out")).toBeInTheDocument();
  });
});
