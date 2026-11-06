import { beforeEach, describe, expect, it } from "vitest";
import type { Habit } from "../domain/habit";
import { updateHabitSchema } from "../domain/update-habit-schema";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";
import { updateHabit } from "./update-habit";

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit", name: "Run", type: "NUMERIC", unit: "km", frequency: [1, 2, 3, 4, 5], userId: "owner",
    createdAt: new Date(0), updatedAt: new Date(0), ...overrides,
  };
}

let repository: InMemoryHabitRepository;
beforeEach(() => {
  repository = new InMemoryHabitRepository();
});

function run(changes: Parameters<typeof updateHabit>[0]["changes"], input: { ownerId?: string; habitId?: string } = {}) {
  return updateHabit({ ownerId: "owner", habitId: "habit", changes, ...input }, repository);
}

describe("updateHabit", () => {
  it("updates name, unit and frequency of the owner's habit", async () => {
    repository.seed(habit());
    const result = await run({ name: "Run far", unit: "mi", frequency: [1, 3] });
    expect(result).toEqual({ ok: true, habit: expect.objectContaining({ name: "Run far", unit: "mi", frequency: [1, 3] }), removedDaysWithLogs: [] });
    expect(repository.habits[0]).toMatchObject({ name: "Run far", unit: "mi", frequency: [1, 3] });
  });

  it("reports only the removed days that have logs, sorted, and keeps those logs", async () => {
    repository.seed(habit(), [
      { id: "tue", completed: true, value: 5, date: "2026-05-19" }, // Tuesday (2)
      { id: "thu", completed: true, value: 3, date: "2026-05-21" }, // Thursday (4)
      { id: "mon", completed: true, value: 1, date: "2026-05-18" }, // Monday (1), kept day
    ]);
    const result = await run({ frequency: [1, 3, 5] });
    expect(result).toMatchObject({ ok: true, removedDaysWithLogs: [2, 4] });
    expect(repository.habits[0].logs.map((log) => log.id)).toEqual(["tue", "thu", "mon"]);
  });

  it("reports nothing when the removed days have no logs", async () => {
    repository.seed(habit(), [{ id: "mon", completed: true, value: 1, date: "2026-05-18" }]);
    expect(await run({ frequency: [1] })).toMatchObject({ ok: true, removedDaysWithLogs: [] });
  });

  it.each([
    ["another user's habit", habit({ userId: "someone-else" })],
    ["a missing habit", habit({ id: "other-id" })],
  ])("returns NOT_FOUND for %s without changing it", async (_label, stored) => {
    repository.seed(stored);
    expect(await run({ name: "Mine" })).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(repository.habits[0].name).toBe("Run");
  });

  it("rejects a unit on a binary habit without changing it", async () => {
    repository.seed(habit({ type: "BINARY", unit: null }));
    expect(await run({ name: "Read", unit: "pages" })).toEqual({ ok: false, error: "UNIT_NOT_ALLOWED" });
    expect(repository.habits[0]).toMatchObject({ name: "Run", unit: null });
  });

  it("accepts unit null on a binary habit", async () => {
    repository.seed(habit({ type: "BINARY", unit: null }));
    expect(await run({ name: "Read", unit: null })).toMatchObject({ ok: true, habit: { name: "Read", unit: null } });
  });

  it.each([null, ""])("rejects unit %j on a numeric habit without changing it", async (unit) => {
    repository.seed(habit());
    expect(await run({ name: "Walk", unit })).toEqual({ ok: false, error: "UNIT_REQUIRED" });
    expect(repository.habits[0]).toMatchObject({ name: "Run", unit: "km" });
  });
});

describe("updateHabitSchema", () => {
  const issues = (input: unknown) => {
    const parsed = updateHabitSchema.safeParse(input);
    return parsed.success ? [] : parsed.error.issues.map((issue) => issue.message);
  };

  it("trims name and unit and sorts frequency", () => {
    expect(updateHabitSchema.parse({ name: " Read ", unit: " km ", frequency: [5, 1] })).toEqual({ name: "Read", unit: "km", frequency: [1, 5] });
  });

  it("accepts a single field", () => {
    expect(updateHabitSchema.parse({ frequency: [0] })).toEqual({ frequency: [0] });
  });

  it.each([
    [{}, "Debes enviar al menos un campo para actualizar"],
    [{ type: "NUMERIC" }, "El tipo de un hábito no se puede modificar"],
    [{ name: "Read", type: "BINARY" }, "El tipo de un hábito no se puede modificar"],
    [{ name: "  " }, "El nombre del hábito es obligatorio"],
    [{ name: "x".repeat(101) }, "El nombre no puede superar 100 caracteres"],
    [{ unit: "x".repeat(31) }, "La unidad no puede superar 30 caracteres"],
    [{ frequency: [] }, "Debes seleccionar al menos un día"],
    [{ frequency: [1, 1] }, "Los días no pueden repetirse"],
  ])("rejects %j with %s", (input, message) => {
    expect(issues(input)).toContain(message);
  });

  it.each([[{ userId: "other" }], [{ name: "Read", id: "x" }], [{ frequency: [7] }], [null], [[]]])("rejects %j", (input) => {
    expect(updateHabitSchema.safeParse(input).success).toBe(false);
  });
});
