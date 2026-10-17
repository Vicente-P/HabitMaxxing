import { beforeEach, describe, expect, it } from "vitest";
import type { Habit } from "../domain/habit";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";
import { setBinaryCompletion } from "./set-binary-completion";

// 2026-05-20 is a Wednesday (3).
const now = new Date("2026-05-20T10:00:00.000Z");

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit", name: "Read", type: "BINARY", unit: null, frequency: [3], userId: "owner",
    createdAt: new Date(0), updatedAt: new Date(0), ...overrides,
  };
}

let repository: InMemoryHabitRepository;
beforeEach(() => {
  repository = new InMemoryHabitRepository();
  repository.seed(habit());
});

function run(input: Partial<Parameters<typeof setBinaryCompletion>[0]> = {}) {
  return setBinaryCompletion({ ownerId: "owner", habitId: "habit", completed: true, ...input }, repository, now);
}

describe("setBinaryCompletion", () => {
  it("creates a completed log for the current UTC date", async () => {
    const result = await run();
    expect(result).toEqual({
      ok: true,
      log: expect.objectContaining({ habitId: "habit", date: "2026-05-20", completed: true, value: null }),
    });
    expect(repository.habits[0].logs).toHaveLength(1);
  });

  it("returns the log fields of the contract", async () => {
    const result = await run();
    if (!result.ok) throw new Error("expected success");
    expect(Object.keys(result.log).sort()).toEqual(["completed", "createdAt", "date", "habitId", "id", "value"]);
  });

  it("reverts to pending by updating the same row instead of deleting it", async () => {
    const first = await run();
    const reverted = await run({ completed: false });
    if (!first.ok || !reverted.ok) throw new Error("expected success");
    expect(reverted.log).toMatchObject({ id: first.log.id, completed: false, date: "2026-05-20" });
    expect(repository.habits[0].logs).toHaveLength(1);
  });

  it("flips back to completed on a second toggle (CA-02)", async () => {
    await run();
    await run({ completed: false });
    const again = await run({ completed: true });
    expect(again).toMatchObject({ ok: true, log: { completed: true } });
    expect(repository.habits[0].logs).toHaveLength(1);
  });

  it("is idempotent when the same state is sent twice", async () => {
    await run();
    await run();
    expect(repository.habits[0].logs).toHaveLength(1);
  });

  it("keeps one row per habit and day across different dates", async () => {
    repository.habits[0].frequency = [3, 2];
    await run();
    await run({ date: "2026-05-19" });
    expect(repository.habits[0].logs.map((log) => log.date).sort()).toEqual(["2026-05-19", "2026-05-20"]);
  });

  it("accepts a past scheduled date", async () => {
    const result = await run({ date: "2026-05-13" });
    expect(result).toMatchObject({ ok: true, log: { date: "2026-05-13" } });
  });

  it("rejects a day the habit is not scheduled", async () => {
    expect(await run({ date: "2026-05-19" })).toEqual({ ok: false, error: "NOT_SCHEDULED" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("rejects future dates", async () => {
    repository.habits[0].frequency = [0, 1, 2, 3, 4, 5, 6];
    expect(await run({ date: "2026-05-21" })).toEqual({ ok: false, error: "FUTURE_DATE" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("rejects a habit owned by someone else", async () => {
    expect(await run({ ownerId: "intruder" })).toEqual({ ok: false, error: "FORBIDDEN" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("rejects a missing habit", async () => {
    expect(await run({ habitId: "missing" })).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("rejects numeric habits until numeric values are supported", async () => {
    repository.habits[0].type = "NUMERIC";
    repository.habits[0].unit = "pages";
    expect(await run()).toEqual({ ok: false, error: "NUMERIC_NOT_SUPPORTED" });
    expect(repository.habits[0].logs).toHaveLength(0);
  });

  it("propagates repository failure", async () => {
    repository.failWith = new Error("private");
    await expect(run()).rejects.toThrow("private");
  });
});
