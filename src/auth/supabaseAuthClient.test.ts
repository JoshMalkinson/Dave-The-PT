import { describe, expect, it, vi } from "vitest";
import { createSupabaseAuthClient } from "./supabaseAuthClient";

describe("createSupabaseAuthClient", () => {
  it("returns signed-out session state", async () => {
    const client = createFakeClient({ session: null });
    const auth = createSupabaseAuthClient(client as never);

    await expect(auth.getSessionState()).resolves.toEqual({
      user: null,
      email: null,
      isSignedIn: false,
    });
  });

  it("returns signed-in session state", async () => {
    const client = createFakeClient({
      session: { user: { id: "user-123", email: "runner@example.com" } },
    });
    const auth = createSupabaseAuthClient(client as never);

    await expect(auth.getSessionState()).resolves.toMatchObject({
      email: "runner@example.com",
      isSignedIn: true,
    });
  });

  it("requests a magic link with the current redirect URL", async () => {
    const client = createFakeClient({ session: null });
    const auth = createSupabaseAuthClient(client as never);

    await auth.sendMagicLink("runner@example.com", "http://localhost:5173/");

    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: "runner@example.com",
      options: {
        emailRedirectTo: "http://localhost:5173/",
      },
    });
  });

  it("signs out through Supabase auth", async () => {
    const client = createFakeClient({ session: null });
    const auth = createSupabaseAuthClient(client as never);

    await auth.signOut();

    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it("unsubscribes from auth state changes", () => {
    const unsubscribe = vi.fn();
    const client = createFakeClient({ session: null, unsubscribe });
    const auth = createSupabaseAuthClient(client as never);

    const cleanup = auth.onAuthStateChange(vi.fn());
    cleanup();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

function createFakeClient({
  session,
  unsubscribe = vi.fn(),
}: {
  session: unknown;
  unsubscribe?: () => void;
}) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe,
          },
        },
      }),
    },
  };
}
