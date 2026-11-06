import { describe, expect, it } from "vitest";
import { getHabitStats } from "./get-habit-stats";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";

const now = new Date("2026-05-20T10:00:00.000Z");
const habit = { id: "h", name: "Read", type: "BINARY" as const, unit: null, frequency: [0, 1, 2, 3, 4, 5, 6], userId: "owner", createdAt: new Date("2026-05-10T08:00:00.000Z"), updatedAt: new Date(0) };
const log = (date: string, completed = true) => ({ id: `log-${date}`, completed, value: null, date });

describe("getHabitStats", () => {
  it("returns the habit, its streak and the current-month completion for the owner (S3)", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit, [log("2026-05-19"), log("2026-05-20")]);
    expect(await getHabitStats({ ownerId: "owner", habitId: "h" }, repository, now)).toEqual({
      ok: true, habit, month: "2026-05", streak: { current: 2, previous: 0, isActive: true },
      completion: { percentage: 18.2, completedDays: 2, scheduledDaysElapsed: 11, message: null },
    });
  });

  it("uses the requested month for completion while the streak stays as of today (S3)", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed({ ...habit, createdAt: new Date("2026-01-01T00:00:00.000Z") }, [log("2026-04-01"), log("2026-05-20")]);
    const result = await getHabitStats({ ownerId: "owner", habitId: "h", month: "2026-04" }, repository, now);
    expect(result).toMatchObject({
      ok: true, month: "2026-04", streak: { current: 1 },
      completion: { completedDays: 1, scheduledDaysElapsed: 30, percentage: 3.3 },
    });
  });

  it("treats a foreign habit exactly like a missing one", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit, [log("2026-05-20")]);
    const foreign = await getHabitStats({ ownerId: "intruder", habitId: "h" }, repository, now);
    const missing = await getHabitStats({ ownerId: "owner", habitId: "nope" }, repository, now);
    expect(foreign).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(missing).toEqual(foreign);
  });
});
