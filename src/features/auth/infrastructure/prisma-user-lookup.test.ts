import { describe, expect, it, vi } from "vitest";
import { createPrismaUserLookup } from "./prisma-user-lookup";

describe("createPrismaUserLookup", () => {
  it("checks account existence with an id-only select", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: "owner" });
    const lookup = createPrismaUserLookup({ user: { findUnique } } as never);
    expect(await lookup.exists("owner")).toBe(true);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "owner" }, select: { id: true } });
  });

  it("reports a missing account as not existing", async () => {
    const lookup = createPrismaUserLookup({ user: { findUnique: vi.fn().mockResolvedValue(null) } } as never);
    expect(await lookup.exists("ghost")).toBe(false);
  });
});
