import { describe, expect, it } from "vitest";
import { getHabitMonthDays } from "./get-habit-month-days";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";

const now = new Date("2026-05-20T10:00:00.000Z");
const habit = { id: "h", name: "Run", type: "NUMERIC" as const, unit: "km", frequency: [0, 1, 2, 3, 4, 5, 6], userId: "owner", createdAt: new Date("2026-05-10T08:00:00.000Z"), updatedAt: new Date(0) };

describe("getHabitMonthDays", () => {
  it("returns the habit, the month and one entry per day built from the month's logs (S1, S2)", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit, [
      { id: "a", completed: true, value: 5, date: "2026-05-12" },
      { id: "b", completed: true, value: 9, date: "2026-04-30" },
    ]);
    const result = await getHabitMonthDays({ ownerId: "owner", habitId: "h", month: "2026-05" }, repository, now);
    if (!result.ok) throw new Error("expected ok");
    expect(result.habit).toEqual(habit);
    expect(result.month).toBe("2026-05");
    expect(result.days).toHaveLength(31);
    expect(result.days[11]).toEqual({ date: "2026-05-12", dayOfWeek: 2, scheduled: true, status: "completed", log: { id: "a", completed: true, value: 5 } });
    expect(result.days[8]).toMatchObject({ date: "2026-05-09", status: "not_scheduled" });
    expect(result.days[9]).toMatchObject({ date: "2026-05-10", status: "missed" });
    expect(result.days[19]).toMatchObject({ date: "2026-05-20", status: "pending" });
  });

  it("defaults to the current UTC month", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit);
    const result = await getHabitMonthDays({ ownerId: "owner", habitId: "h" }, repository, now);
    expect(result).toMatchObject({ ok: true, month: "2026-05" });
  });

  it("treats a foreign habit exactly like a missing one (S2)", async () => {
    const repository = new InMemoryHabitRepository();
    repository.seed(habit);
    const foreign = await getHabitMonthDays({ ownerId: "intruder", habitId: "h", month: "2026-05" }, repository, now);
    const missing = await getHabitMonthDays({ ownerId: "owner", habitId: "nope", month: "2026-05" }, repository, now);
    expect(foreign).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(missing).toEqual(foreign);
  });
});
