import { beforeEach, describe, expect, it } from "vitest";
import type { Habit } from "../domain/habit";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";
import { setNumericValue } from "./set-numeric-value";

// 2026-05-20 is a Wednesday (3).
const now = new Date("2026-05-20T10:00:00.000Z");

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit", name: "Run", type: "NUMERIC", unit: "km", frequency: [3], userId: "owner",
    createdAt: new Date(0), updatedAt: new Date(0), ...overrides,
  };
}

let repository: InMemoryHabitRepository;
beforeEach(() => {
  repository = new InMemoryHabitRepository();
  repository.seed(habit());
});

function run(input: Partial<Parameters<typeof setNumericValue>[0]> = {}) {
  return setNumericValue({ ownerId: "owner", habitId: "habit", value: 5, ...input }, repository, now);
}

describe("setNumericValue", () => {
  it("creates a completed log with the value for the current UTC date", async () => {
    expect(await run()).toEqual({
      ok: true,
      log: expect.objectContaining({ habitId: "habit", date: "2026-05-20", completed: true, value: 5 }),
    });
    expect(repository.habits[0].logs).toHaveLength(1);
  });

  it("replaces the previous value of the same day in the same row", async () => {
    const first = await run();
    const second = await run({ value: 8 });
    if (!first.ok || !second.ok) throw new Error("expected success");
    expect(second.log).toMatchObject({ id: first.log.id, value: 8, completed: true });
    expect(repository.habits[0].logs).toHaveLength(1);
    expect(repository.habits[0].logs[0].value).toBe(8);
  });

  it("keeps one row per day across different dates", async () => {
    repository.habits[0].frequency = [3, 2];
    await run();
    await run({ date: "2026-05-19", value: 2 });
    expect(repository.habits[0].logs.map((log) => log.date).sort()).toEqual(["2026-05-19", "2026-05-20"]);
  });

  it("rejects future dates", async () => {
    repository.habits[0].frequency = [0, 1, 2, 3, 4, 5, 6];
    expect(await run({ date: "2026-05-21" })).toEqual({ ok: false, error: "FUTURE_DATE" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("rejects a day the habit is not scheduled", async () => {
    expect(await run({ date: "2026-05-19" })).toEqual({ ok: false, error: "NOT_SCHEDULED" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("reports a foreign habit exactly like a missing one", async () => {
    const foreign = await run({ ownerId: "intruder" });
    expect(foreign).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(foreign).toEqual(await run({ habitId: "missing" }));
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("rejects a value for a binary habit as a type mismatch", async () => {
    repository.habits[0].type = "BINARY";
    repository.habits[0].unit = null;
    expect(await run()).toEqual({ ok: false, error: "TYPE_MISMATCH" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("propagates repository failure", async () => {
    repository.failWith = new Error("private");
    await expect(run()).rejects.toThrow("private");
  });
});
