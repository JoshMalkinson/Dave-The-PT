import { describe, expect, it } from "vitest";
import {
  mapPlanDataToSupabaseRows,
  mapSupabaseRowsToPlanData,
  SupabasePlanRepository,
} from "./supabasePlanRepository";
import { demoPlanData } from "../data/planData";

describe("Supabase plan row mapping", () => {
  it("maps plan data to normalized Supabase rows", () => {
    const rows = mapPlanDataToSupabaseRows(demoPlanData, "user-123");

    expect(rows.profile).toEqual({
      id: "user-123",
      display_name: demoPlanData.planInput.athlete.name,
    });
    expect(rows.athleteSettings.user_id).toBe("user-123");
    expect(rows.raceGoal.name).toBe(demoPlanData.planInput.race.name);
    expect(rows.availabilityWindows).toContainEqual({
      user_id: "user-123",
      day_label: "Tuesday",
      training_window: "evening",
    });
    expect(rows.plannedWorkouts[0]).toMatchObject({
      user_id: "user-123",
      external_id: demoPlanData.planInput.workouts[0].id,
    });
    expect(rows.weatherSnapshots).toHaveLength(7);
  });

  it("maps Supabase rows back to plan data", () => {
    const rows = mapPlanDataToSupabaseRows(demoPlanData, "user-123");

    const planData = mapSupabaseRowsToPlanData(rows);

    expect(planData).toEqual(demoPlanData);
  });
});

describe("SupabasePlanRepository", () => {
  it("returns demo data and skips saves when no Supabase user is signed in", async () => {
    const client = createFakeSupabaseClient({ userId: null });
    const repository = new SupabasePlanRepository(client as never);

    await expect(repository.load()).resolves.toEqual(demoPlanData);
    await repository.save(demoPlanData);

    expect(client.operations).toEqual([]);
  });

  it("treats a missing Supabase auth session as an unsigned-out user", async () => {
    const client = createFakeSupabaseClient({
      authError: { message: "Auth session missing!" },
      userId: null,
    });
    const repository = new SupabasePlanRepository(client as never);

    await expect(repository.load()).resolves.toEqual(demoPlanData);
    await repository.save(demoPlanData);

    expect(client.operations).toEqual([]);
  });

  it("writes signed-in plan data to user-owned Supabase tables", async () => {
    const client = createFakeSupabaseClient({ userId: "user-123" });
    const repository = new SupabasePlanRepository(client as never);

    await repository.save(demoPlanData);

    expect(client.operations).toContainEqual({
      type: "upsert",
      tableName: "profiles",
      payload: {
        id: "user-123",
        display_name: demoPlanData.planInput.athlete.name,
      },
    });
    expect(client.operations).toContainEqual({
      type: "delete",
      tableName: "planned_workouts",
      filters: [{ column: "user_id", value: "user-123" }],
    });
    expect(client.operations).toContainEqual({
      type: "insert",
      tableName: "weather_snapshots",
      payloadLength: 7,
    });
  });

  it("loads signed-in plan data from Supabase rows", async () => {
    const rows = mapPlanDataToSupabaseRows(demoPlanData, "user-123");
    const client = createFakeSupabaseClient({
      userId: "user-123",
      tableData: {
        profiles: rows.profile,
        athlete_settings: rows.athleteSettings,
        race_goals: rows.raceGoal,
        availability_windows: rows.availabilityWindows,
        planned_workouts: rows.plannedWorkouts,
        weather_snapshots: rows.weatherSnapshots,
      },
    });
    const repository = new SupabasePlanRepository(client as never);

    await expect(repository.load()).resolves.toEqual(demoPlanData);
  });
});

interface FakeOperation {
  type: "upsert" | "delete" | "insert";
  tableName: string;
  filters?: Array<{ column: string; value: unknown }>;
  payload?: unknown;
  payloadLength?: number;
}

interface FakeSupabaseClient {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
  from: (tableName: string) => FakeQuery;
  operations: FakeOperation[];
}

interface FakeQuery {
  select: () => FakeQuery;
  eq: (column: string, value: unknown) => FakeQuery;
  order: () => FakeQuery;
  limit: () => FakeQuery;
  maybeSingle: () => Promise<{ data: unknown; error: null }>;
  upsert: (payload: unknown) => Promise<{ error: null }>;
  delete: () => FakeQuery;
  insert: (payload: unknown[]) => Promise<{ error: null }>;
  then: (
    resolve?: ((value: { data: unknown; error: null }) => unknown) | null,
    reject?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
}

function createFakeSupabaseClient({
  authError = null,
  userId,
  tableData = {},
}: {
  authError?: { message: string } | null;
  userId: string | null;
  tableData?: Record<string, unknown>;
}): FakeSupabaseClient {
  const operations: FakeOperation[] = [];

  return {
    operations,
    auth: {
      getUser: async () => ({
        data: { user: userId ? { id: userId } : null },
        error: authError,
      }),
    },
    from: (tableName) => createFakeQuery(tableName, tableData, operations),
  };
}

function createFakeQuery(
  tableName: string,
  tableData: Record<string, unknown>,
  operations: FakeOperation[],
): FakeQuery {
  const filters: Array<{ column: string; value: unknown }> = [];
  const query = {
    select: () => query,
    eq: (column: string, value: unknown) => {
      filters.push({ column, value });
      return query;
    },
    order: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: tableData[tableName] ?? null, error: null }),
    upsert: async (payload: unknown) => {
      operations.push({ type: "upsert", tableName, payload });
      return { error: null };
    },
    delete: () => query,
    insert: async (payload: unknown[]) => {
      operations.push({ type: "insert", tableName, payloadLength: payload.length });
      return { error: null };
    },
    then: (
      resolve?: ((value: { data: unknown; error: null }) => unknown) | null,
      reject?: ((reason: unknown) => unknown) | null,
    ) => Promise.resolve({ data: tableData[tableName] ?? [], error: null }).then(resolve, reject),
  };

  const originalEq = query.eq;
  query.eq = (column: string, value: unknown) => {
    originalEq(column, value);
    if (operations[operations.length - 1]?.type !== "delete") {
      return query;
    }
    return query;
  };

  const originalDelete = query.delete;
  query.delete = () => {
    originalDelete();
    operations.push({ type: "delete", tableName, filters });
    return query;
  };

  return query;
}
