import { describe, expect, it } from "vitest";
import { demoPlanData } from "../data/planData";
import { LocalPlanRepository } from "./localPlanRepository";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  length = 0;

  clear(): void {
    this.values.clear();
    this.length = 0;
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
    this.length = this.values.size;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
    this.length = this.values.size;
  }
}

describe("LocalPlanRepository", () => {
  it("loads demo plan data when storage is empty", async () => {
    const repository = new LocalPlanRepository(new MemoryStorage());

    await expect(repository.load()).resolves.toEqual(demoPlanData);
  });

  it("saves and reloads edited plan data", async () => {
    const storage = new MemoryStorage();
    const repository = new LocalPlanRepository(storage);
    const edited = {
      ...demoPlanData,
      planInput: {
        ...demoPlanData.planInput,
        athlete: {
          ...demoPlanData.planInput.athlete,
          recoveryScore: 47,
        },
      },
    };

    await repository.save(edited);

    await expect(repository.load()).resolves.toEqual(edited);
  });

  it("resets storage back to demo plan data", async () => {
    const storage = new MemoryStorage();
    const repository = new LocalPlanRepository(storage);
    await repository.save({
      ...demoPlanData,
      planInput: {
        ...demoPlanData.planInput,
        race: { ...demoPlanData.planInput.race, name: "Changed Race" },
      },
    });

    await repository.reset();

    await expect(repository.load()).resolves.toEqual(demoPlanData);
  });
});
