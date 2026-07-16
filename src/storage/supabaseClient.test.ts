import { describe, expect, it, vi } from "vitest";
import { createSupabaseBrowserClient } from "./supabaseClient";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((url: string, anonKey: string) => ({ anonKey, url })),
}));

describe("createSupabaseBrowserClient", () => {
  it("reuses the browser client for the same Supabase credentials", () => {
    const firstClient = createSupabaseBrowserClient("https://project.supabase.co", "anon-key");
    const secondClient = createSupabaseBrowserClient("https://project.supabase.co", "anon-key");

    expect(secondClient).toBe(firstClient);
  });
});
