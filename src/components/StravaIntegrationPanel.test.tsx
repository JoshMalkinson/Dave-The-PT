import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StravaIntegrationPanel } from "./StravaIntegrationPanel";

describe("StravaIntegrationPanel", () => {
  it("explains when the Strava client id is missing", () => {
    render(
      <StravaIntegrationPanel
        clientId={undefined}
        isSignedIn={true}
        status=""
        onConnect={vi.fn()}
      />,
    );

    expect(screen.getByText(/VITE_STRAVA_CLIENT_ID/)).toBeInTheDocument();
  });

  it("requires Supabase sign-in before Strava connect", () => {
    render(
      <StravaIntegrationPanel
        clientId="123"
        isSignedIn={false}
        status=""
        onConnect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Connect Strava" })).toBeDisabled();
    expect(screen.getByText(/Sign into Supabase/)).toBeInTheDocument();
  });

  it("starts Strava OAuth when configured and signed in", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(
      <StravaIntegrationPanel
        clientId="123"
        isSignedIn={true}
        status="Ready"
        onConnect={onConnect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect Strava" }));

    expect(onConnect).toHaveBeenCalled();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
