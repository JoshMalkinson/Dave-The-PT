import { describe, expect, it } from "vitest";
import { LocalPlanRepository } from "./localPlanRepository";
import { SupabasePlanRepository } from "./supabasePlanRepository";
import { createPlanRepository } from "./createPlanRepository";

describe("createPlanRepository", () => {
  it("uses local storage when Supabase env vars are missing", () => {
    const repository = createPlanRepository({}, window.localStorage);

    expect(repository).toBeInstanceOf(LocalPlanRepository);
    expect(repository.mode).toBe("local");
  });

  it("uses Supabase when both browser credentials exist", () => {
    const repository = createPlanRepository(
      {
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
      },
      window.localStorage,
    );

    expect(repository).toBeInstanceOf(SupabasePlanRepository);
    expect(repository.mode).toBe("supabase");
  });
});
