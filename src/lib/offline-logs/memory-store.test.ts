import { describe, expect, it } from "vitest";
import { createMemoryPendingLogStore } from "./memory-store";
import { pendingLogKey, type PendingLog } from "./types";

const log = (overrides: Partial<PendingLog> = {}): PendingLog => ({
  ownerId: "u1",
  habitId: "h1",
  date: "2026-11-06",
  payload: { completed: true },
  queuedAt: 1,
  ...overrides,
});

describe("pendingLogKey", () => {
  it("joins owner, habit and date", () => {
    expect(pendingLogKey(log())).toBe("u1:h1:2026-11-06");
  });
});

describe("memory pending log store", () => {
  it("stores and lists a record", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    expect(await store.list("u1")).toEqual([log()]);
  });

  it("replaces the record with the same owner, habit and date (last write wins)", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log({ queuedAt: 1 }));
    await store.put(log({ payload: { completed: false }, queuedAt: 2 }));
    expect(await store.list("u1")).toEqual([log({ payload: { completed: false }, queuedAt: 2 })]);
  });

  it("keeps different habits and dates as separate records", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    await store.put(log({ habitId: "h2", queuedAt: 2 }));
    await store.put(log({ date: "2026-11-05", queuedAt: 3 }));
    expect(await store.list("u1")).toHaveLength(3);
  });

  it("removes a record when queuedAt still matches", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    await store.remove(log());
    expect(await store.list("u1")).toEqual([]);
  });

  it("keeps a newer record when removing an older version", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log({ queuedAt: 1 }));
    await store.put(log({ payload: { completed: false }, queuedAt: 2 }));
    await store.remove(log({ queuedAt: 1 }));
    expect(await store.list("u1")).toEqual([log({ payload: { completed: false }, queuedAt: 2 })]);
  });

  it("ignores removal of a missing record", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    await store.remove(log({ habitId: "other" }));
    expect(await store.list("u1")).toHaveLength(1);
  });

  it("lists oldest queuedAt first", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log({ habitId: "c", queuedAt: 30 }));
    await store.put(log({ habitId: "a", queuedAt: 10 }));
    await store.put(log({ habitId: "b", queuedAt: 20 }));
    expect((await store.list("u1")).map((entry) => entry.habitId)).toEqual(["a", "b", "c"]);
  });

  it("lists only the records of the requested owner", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    await store.put(log({ ownerId: "u2" }));
    expect((await store.list("u2")).map((entry) => entry.ownerId)).toEqual(["u2"]);
    expect(await store.list("nobody")).toEqual([]);
  });

  it("clears only the records of one owner", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    await store.put(log({ habitId: "h2" }));
    await store.put(log({ ownerId: "u2" }));
    await store.clear("u1");
    expect(await store.list("u1")).toEqual([]);
    expect(await store.list("u2")).toHaveLength(1);
  });

  it("does not expose internal state through returned records", async () => {
    const store = createMemoryPendingLogStore();
    await store.put(log());
    (await store.list("u1"))[0].queuedAt = 999;
    expect((await store.list("u1"))[0].queuedAt).toBe(1);
  });
});
