import { describe, expect, it } from "vitest";
import { getHabitStreak } from "./get-habit-streak";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";

const now = new Date("2026-05-20T10:00:00.000Z");
const habit = { id: "h", name: "Read", type: "BINARY" as const, unit: null, frequency: [0, 1, 2, 3, 4, 5, 6], userId: "owner", createdAt: new Date(0), updatedAt: new Date(0) };
const log = (date: string, completed = true) => ({ id: `log-${date}`, completed, value: null, date });

describe("getHabitStreak", () => {
  it("returns the habit and its streak for the owner", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit, [log("2026-05-19"), log("2026-05-20")]);
    expect(await getHabitStreak({ ownerId: "owner", habitId: "h" }, repository, now)).toEqual({
      ok: true, habit, streak: { current: 2, previous: 0, isActive: true },
    });
  });

  it("treats a foreign habit exactly like a missing one", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit, [log("2026-05-20")]);
    const foreign = await getHabitStreak({ ownerId: "intruder", habitId: "h" }, repository, now);
    const missing = await getHabitStreak({ ownerId: "owner", habitId: "nope" }, repository, now);
    expect(foreign).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(missing).toEqual(foreign);
  });
});
