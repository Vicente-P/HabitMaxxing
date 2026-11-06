import { beforeEach, describe, expect, it } from "vitest";
import type { Habit } from "../domain/habit";
import { createHabit } from "./create-habit";
import { listDailyHabits } from "./list-daily-habits";
import { listHabitCatalog } from "./list-habit-catalog";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit", name: "Read", type: "BINARY", unit: null, frequency: [0], userId: "owner",
    createdAt: new Date(0), updatedAt: new Date(0), ...overrides,
  };
}

let repository: InMemoryHabitRepository;
beforeEach(() => { repository = new InMemoryHabitRepository(); });

describe("createHabit", () => {
  it("persists binary habits with null unit and the session owner", async () => {
    const created = await createHabit({ name: "Read", type: "BINARY", frequency: [0] }, "owner", repository);
    expect(created).toMatchObject({ name: "Read", type: "BINARY", unit: null, frequency: [0], userId: "owner" });
    expect(repository.habits).toHaveLength(1);
  });

  it("persists a numeric unit", async () => {
    const created = await createHabit({ name: "Read", type: "NUMERIC", unit: "pages", frequency: [0] }, "owner", repository);
    expect(created.unit).toBe("pages");
  });

  it("returns only the habit scalar fields", async () => {
    const created = await createHabit({ name: "Read", type: "BINARY", frequency: [0] }, "owner", repository);
    expect(Object.keys(created).sort()).toEqual(["createdAt", "frequency", "id", "name", "type", "unit", "updatedAt", "userId"]);
  });

  it("propagates repository failure", async () => {
    repository.failWith = new Error("private");
    await expect(createHabit({ name: "Read", type: "BINARY", frequency: [0] }, "owner", repository)).rejects.toThrow();
  });
});

describe("listHabitCatalog", () => {
  it("returns an empty catalog for an owner without habits", async () => {
    expect(await listHabitCatalog("owner", repository)).toEqual([]);
  });

  it.each(["owner", "different-owner"])("scopes the catalog to %s", async (ownerId) => {
    repository.seed(habit({ id: "mine", userId: ownerId }));
    repository.seed(habit({ id: "foreign", userId: "someone-else" }));
    expect(await listHabitCatalog(ownerId, repository)).toEqual([habit({ id: "mine", userId: ownerId })]);
  });

  it("retains habits regardless of weekday and orders newest first, then by id", async () => {
    repository.seed(habit({ id: "b", frequency: [1], createdAt: new Date(1) }));
    repository.seed(habit({ id: "c", frequency: [2], createdAt: new Date(2) }));
    repository.seed(habit({ id: "a", frequency: [3], createdAt: new Date(1) }));
    expect((await listHabitCatalog("owner", repository)).map((h) => h.id)).toEqual(["c", "a", "b"]);
  });

  it("propagates repository failure", async () => {
    repository.failWith = new Error("private");
    await expect(listHabitCatalog("owner", repository)).rejects.toThrow();
  });
});

describe("listDailyHabits", () => {
  const log = { id: "log", completed: true, value: null, date: "2026-05-20" };

  it("returns scheduled habits with that date's log and metadata", async () => {
    repository.seed(habit({ id: "scheduled", frequency: [1, 3] }), [log, { ...log, id: "other", date: "2026-05-19" }]);
    repository.seed(habit({ id: "off-day", frequency: [0] }));
    const result = await listDailyHabits("owner", 3, "2026-05-20", repository);
    expect(result).toEqual({
      data: [{ ...habit({ id: "scheduled", frequency: [1, 3] }), todayLog: log }],
      meta: { day: 3, date: "2026-05-20", total: 1 },
    });
  });

  it("returns a null todayLog when the date has no log", async () => {
    repository.seed(habit({ frequency: [3] }));
    const result = await listDailyHabits("owner", 3, "2026-05-20", repository);
    expect(result.data[0].todayLog).toBeNull();
  });

  it("returns empty data with zero total when nothing is scheduled", async () => {
    expect(await listDailyHabits("owner", 3, "2026-05-20", repository)).toEqual({ data: [], meta: { day: 3, date: "2026-05-20", total: 0 } });
  });

  it("does not leak other owners' habits", async () => {
    repository.seed(habit({ userId: "foreign", frequency: [3] }));
    expect((await listDailyHabits("owner", 3, "2026-05-20", repository)).meta.total).toBe(0);
  });
});
