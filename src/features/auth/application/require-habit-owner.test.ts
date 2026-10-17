import { describe, expect, it, vi } from "vitest";
import { requireHabitOwner } from "./require-habit-owner";

function users(exists = true) {
  return { exists: vi.fn().mockResolvedValue(exists) };
}

describe("requireHabitOwner", () => {
  it.each([null, {}, { user: {} }, { user: { id: "" } }, { user: { id: "  " } }, { user: { id: 3 } }])("rejects missing identity without user lookup %j", async (session) => {
    const lookup = users();
    expect(await requireHabitOwner(session, lookup)).toBeNull();
    expect(lookup.exists).not.toHaveBeenCalled();
  });

  it("returns the session id when the account exists and null when it does not", async () => {
    const lookup = users();
    expect(await requireHabitOwner({ user: { id: "owner" } }, lookup)).toBe("owner");
    expect(lookup.exists).toHaveBeenCalledWith("owner");
    lookup.exists.mockResolvedValueOnce(false);
    expect(await requireHabitOwner({ user: { id: "owner" } }, lookup)).toBeNull();
  });

  it("propagates lookup failure rather than treating it as anonymous", async () => {
    const lookup = users();
    lookup.exists.mockRejectedValueOnce(new Error("private"));
    await expect(requireHabitOwner({ user: { id: "owner" } }, lookup)).rejects.toThrow();
  });
});
