import { describe, expect, it, vi } from "vitest";
import { requireHabitOwner } from "./habits";

function database() {
  return { user: { findUnique: vi.fn().mockResolvedValue({ id: "owner" }) } };
}

describe("habit ownership", () => {
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
});
