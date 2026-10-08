import { describe, expect, it, vi } from "vitest";
import { createHabit, requireHabitOwner, habitSelect } from "./habits";

function database() {
  return { user: { findUnique: vi.fn().mockResolvedValue({ id: "owner" }) }, habit: { create: vi.fn().mockResolvedValue({ id: "habit" }) } };
}

describe("habit ownership and persistence", () => {
  it.each([null, {}, { user: {} }, { user: { id: "" } }, { user: { id: "  " } }, { user: { id: 3 } }])("rejects missing identity without DB access %j", async (session) => {
    const db = database();
    expect(await requireHabitOwner(session, db)).toBeNull();
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it("checks account existence with an id-only select", async () => {
    const db = database();
    expect(await requireHabitOwner({ user: { id: "owner" } }, db)).toBe("owner");
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: "owner" }, select: { id: true } });
    db.user.findUnique.mockResolvedValueOnce(null);
    expect(await requireHabitOwner({ user: { id: "owner" } }, db)).toBeNull();
  });
  it("propagates lookup failure rather than treating it as anonymous", async () => {
    const db = database(); db.user.findUnique.mockRejectedValueOnce(new Error("private"));
    await expect(requireHabitOwner({ user: { id: "owner" } }, db)).rejects.toThrow();
  });
  it("persists binary null and only explicit fields with session owner", async () => {
    const db = database();
    await createHabit({ name: "Read", type: "BINARY", frequency: [0] }, "owner", db);
    expect(db.habit.create).toHaveBeenCalledWith({ data: { name: "Read", type: "BINARY", unit: null, frequency: [0], userId: "owner" }, select: habitSelect });
    expect(habitSelect).not.toHaveProperty("user");
    expect(habitSelect).not.toHaveProperty("logs");
  });
  it("persists a numeric unit", async () => {
    const db = database();
    await createHabit({ name: "Read", type: "NUMERIC", unit: "pages", frequency: [0] }, "owner", db);
    expect(db.habit.create.mock.calls[0][0].data.unit).toBe("pages");
  });
});
