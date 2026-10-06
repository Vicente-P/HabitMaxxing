import { describe, expect, it, vi } from "vitest";
import { Prisma, type User } from "@/generated/prisma";
import { verifyLogin, type LoginDependencies } from "./login-policy";

const credentials = { email: " USER@example.com ", password: "password123" };
const safeUser = { id: "u1", email: "user@example.com", name: "User" };
const initialUser = { ...safeUser, password: "test-hash", failedLoginAttempts: 0, lockedUntil: null };

// Serialized in-memory transactions model ordering/rollback, not PostgreSQL isolation.
function fixture(initial: Partial<User> = {}) {
  let user = { ...initialUser, ...initial };
  let time = Date.UTC(2026, 9, 6);
  let tail: Promise<unknown> = Promise.resolve();
  const findUnique = vi.fn(async (args: { where: { email: string } }) => args.where.email === user.email ? { ...user } : null);
  const update = vi.fn(async ({ data }: { data: Partial<typeof user> }) => {
    user = { ...user, ...data };
    return { ...user };
  });
  const transaction = vi.fn((work: (tx: unknown) => Promise<unknown>) => {
    const result = tail.then(async () => {
      const before = { ...user };
      try { return await work({ user: { findUnique, update } }); }
      catch (error) { user = before; throw error; }
    });
    tail = result.catch(() => undefined);
    return result;
  });
  const compare = vi.fn(async (password: string) => password === "password123");
  const dependencies = {
    database: { $transaction: transaction } as unknown as LoginDependencies["database"],
    compare,
    now: () => new Date(time),
  };
  return { dependencies, findUnique, update, transaction, compare, state: () => user, advance: (ms: number) => { time += ms; } };
}

describe("login lock policy", () => {
  it("normalizes credentials, returns safe identity, and resets prior failures", async () => {
    const f = fixture({ failedLoginAttempts: 4 });
    expect(await verifyLogin(credentials, f.dependencies)).toEqual(safeUser);
    expect(f.state()).toMatchObject({ failedLoginAttempts: 0, lockedUntil: null });
    expect(f.findUnique.mock.calls[0][0]).toMatchObject({ where: { email: "user@example.com" } });
  });

  it("commits failures 1–5, then denies correct credentials without extending the lock", async () => {
    const f = fixture();
    for (let attempt = 1; attempt <= 5; attempt++) {
      expect(await verifyLogin({ ...credentials, password: "wrong" }, f.dependencies)).toBeNull();
      expect(f.state().failedLoginAttempts).toBe(attempt);
      expect(Boolean(f.state().lockedUntil)).toBe(attempt === 5);
    }
    const deadline = f.state().lockedUntil;
    f.advance(60_000);
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.state()).toMatchObject({ failedLoginAttempts: 5, lockedUntil: deadline });
  });

  it.each([0, 1])("starts a fresh failure sequence at/after expiry offset %i", async (offset) => {
    const f = fixture({ failedLoginAttempts: 5, lockedUntil: new Date(Date.UTC(2026, 9, 6)) });
    f.advance(offset);
    expect(await verifyLogin({ ...credentials, password: "wrong" }, f.dependencies)).toBeNull();
    expect(f.state()).toMatchObject({ failedLoginAttempts: 1, lockedUntil: null });
  });

  it("resets an expired lock on success and permits a subsequent fresh lock", async () => {
    const f = fixture({ failedLoginAttempts: 5, lockedUntil: new Date(Date.UTC(2026, 9, 6)) });
    expect(await verifyLogin(credentials, f.dependencies)).toEqual(safeUser);
    expect(f.state()).toMatchObject({ failedLoginAttempts: 0, lockedUntil: null });
    for (let i = 0; i < 5; i++) await verifyLogin({ ...credentials, password: "wrong" }, f.dependencies);
    expect(f.state().lockedUntil?.getTime()).toBe(Date.UTC(2026, 9, 6) + 15 * 60_000);
  });

  it("serializes simultaneous failures without lost increments", async () => {
    const f = fixture();
    expect(await Promise.all(Array.from({ length: 6 }, () => verifyLogin({ ...credentials, password: "wrong" }, f.dependencies)))).toEqual(Array(6).fill(null));
    expect(f.state()).toMatchObject({ failedLoginAttempts: 5, lockedUntil: new Date(Date.UTC(2026, 9, 6) + 15 * 60_000) });
  });

  it.each([true, false])("orders a successful request against the fifth failure (success first=%s)", async (successFirst) => {
    const f = fixture({ failedLoginAttempts: 4 });
    const good = () => verifyLogin(credentials, f.dependencies);
    const bad = () => verifyLogin({ ...credentials, password: "wrong" }, f.dependencies);
    const results = await Promise.all(successFirst ? [good(), bad()] : [bad(), good()]);
    expect(results).toEqual(successFirst ? [safeUser, null] : [null, null]);
    expect(f.state().failedLoginAttempts).toBe(successFirst ? 1 : 5);
  });

  it("evaluates the clock after waiting for the database read", async () => {
    const f = fixture({ failedLoginAttempts: 5, lockedUntil: new Date(Date.UTC(2026, 9, 6) + 1000) });
    f.findUnique.mockImplementationOnce(async () => { f.advance(1000); return { ...f.state() }; });
    expect(await verifyLogin(credentials, f.dependencies)).toEqual(safeUser);
  });

  it("starts the full lock duration after password verification completes", async () => {
    const f = fixture({ failedLoginAttempts: 4 });
    f.compare.mockImplementationOnce(async () => { f.advance(2000); return false; });
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.state().lockedUntil?.getTime()).toBe(Date.UTC(2026, 9, 6) + 2000 + 15 * 60_000);
  });

  it("rejects malformed input before DB work and performs dummy verification for unknown email", async () => {
    const f = fixture();
    expect(await verifyLogin({ email: "invalid", password: "wrong" }, f.dependencies)).toBeNull();
    expect(f.transaction).not.toHaveBeenCalled();
    f.findUnique.mockResolvedValueOnce(null as never);
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.compare).toHaveBeenCalledTimes(1);
    expect(f.update).not.toHaveBeenCalled();
  });

  it("retries only actual Prisma serialization conflicts with a bounded budget", async () => {
    const f = fixture();
    const conflict = new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2034", clientVersion: "test" });
    f.transaction.mockRejectedValueOnce(conflict);
    expect(await verifyLogin(credentials, f.dependencies)).toEqual(safeUser);
    expect(f.transaction).toHaveBeenCalledTimes(2);
    expect(f.transaction).toHaveBeenLastCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: "Serializable" }));
    f.transaction.mockClear().mockRejectedValue(conflict);
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.transaction).toHaveBeenCalledTimes(3);
  });

  it.each([new Error("database unavailable"), { code: "P2034" }, new Prisma.PrismaClientKnownRequestError("other failure", { code: "P2002", clientVersion: "test" })])("fails closed without retrying unexpected infrastructure errors", async (error) => {
    const f = fixture();
    f.transaction.mockRejectedValue(error);
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.transaction).toHaveBeenCalledTimes(1);
  });

  it("never authenticates when password verification or persistence fails", async () => {
    const f = fixture();
    f.compare.mockRejectedValueOnce(new Error("comparison failed"));
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    f.update.mockRejectedValueOnce(new Error("write failed"));
    expect(await verifyLogin(credentials, f.dependencies)).toBeNull();
    expect(f.state().failedLoginAttempts).toBe(0);
  });
});
