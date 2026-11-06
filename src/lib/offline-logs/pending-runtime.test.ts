import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryPendingLogStore } from "./memory-store";
import { configurePendingRuntime, pendingRuntime } from "./pending-runtime";
import type { PendingLogStore } from "./types";

const respond = (status: number) => new Response(null, { status });
const asFetch = (mock: unknown) => mock as typeof fetch;
const entry = (habitId: string, date = "2026-11-06", payload: { completed: boolean } | { value: number } = { completed: true }) => ({ habitId, date, payload });
const keys = (logs: readonly { habitId: string; date: string }[]) => logs.map((log) => `${log.habitId}:${log.date}`);

let store: PendingLogStore;
let fetchImpl: ReturnType<typeof vi.fn>;

beforeEach(() => {
  store = createMemoryPendingLogStore();
  fetchImpl = vi.fn(async () => respond(200));
  configurePendingRuntime({ store, fetchImpl: asFetch(fetchImpl) });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("pendingRuntime init and enqueue", () => {
  it("starts empty with no owner", () => {
    expect(pendingRuntime.getSnapshot()).toEqual({ ownerId: null, pending: [], discarded: [], unauthorized: false, syncVersion: 0 });
  });

  it("refuses to enqueue without an owner", async () => {
    expect(await pendingRuntime.enqueue(entry("h1"))).toBe(false);
    expect(pendingRuntime.getSnapshot().pending).toEqual([]);
  });

  it("loads the owner's queue from the store, oldest first, ignoring other owners", async () => {
    await store.put({ ownerId: "u1", ...entry("b"), queuedAt: 20 });
    await store.put({ ownerId: "u1", ...entry("a"), queuedAt: 10 });
    await store.put({ ownerId: "u2", ...entry("c"), queuedAt: 5 });
    await pendingRuntime.init("u1");
    const snapshot = pendingRuntime.getSnapshot();
    expect(snapshot.ownerId).toBe("u1");
    expect(snapshot.pending.map((log) => log.habitId)).toEqual(["a", "b"]);
  });

  it("stores the record with owner, payload and a strictly increasing queuedAt, and updates the snapshot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    await pendingRuntime.init("u1");
    expect(await pendingRuntime.enqueue(entry("a"))).toBe(true);
    expect(await pendingRuntime.enqueue(entry("b", "2026-11-06", { value: 4 }))).toBe(true);
    const stored = await store.list("u1");
    expect(stored).toEqual([
      { ownerId: "u1", habitId: "a", date: "2026-11-06", payload: { completed: true }, queuedAt: 1000 },
      { ownerId: "u1", habitId: "b", date: "2026-11-06", payload: { value: 4 }, queuedAt: 1001 },
    ]);
    expect(pendingRuntime.getSnapshot().pending).toEqual(stored);
  });

  it("coalesces the same habit and date: the latest value wins and goes last", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a", "2026-11-06", { completed: true }));
    await pendingRuntime.enqueue(entry("b"));
    await pendingRuntime.enqueue(entry("a", "2026-11-06", { completed: false }));
    const pending = pendingRuntime.getSnapshot().pending;
    expect(pending.map((log) => [log.habitId, log.payload])).toEqual([["b", { completed: true }], ["a", { completed: false }]]);
    expect(await store.list("u1")).toHaveLength(2);
  });

  it("keeps different dates of the same habit apart", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a", "2026-11-05"));
    await pendingRuntime.enqueue(entry("a", "2026-11-06"));
    expect(pendingRuntime.getSnapshot().pending).toHaveLength(2);
  });

  it("returns false and leaves the snapshot unchanged when the store fails", async () => {
    configurePendingRuntime({
      store: { ...store, put: async () => { throw new Error("quota"); } },
      fetchImpl: asFetch(fetchImpl),
    });
    await pendingRuntime.init("u1");
    expect(await pendingRuntime.enqueue(entry("a"))).toBe(false);
    expect(pendingRuntime.getSnapshot().pending).toEqual([]);
  });

  it("keeps the snapshot referentially stable until something changes and notifies subscribers", async () => {
    await pendingRuntime.init("u1");
    const first = pendingRuntime.getSnapshot();
    expect(pendingRuntime.getSnapshot()).toBe(first);
    const listener = vi.fn();
    const unsubscribe = pendingRuntime.subscribe(listener);
    await pendingRuntime.enqueue(entry("a"));
    expect(listener).toHaveBeenCalled();
    expect(pendingRuntime.getSnapshot()).not.toBe(first);
    listener.mockClear();
    unsubscribe();
    await pendingRuntime.enqueue(entry("b"));
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("pendingRuntime owner switch", () => {
  it("never shows or syncs another owner's queue and resets discarded/unauthorized", async () => {
    await store.put({ ownerId: "u1", ...entry("a"), queuedAt: 1 });
    fetchImpl.mockResolvedValue(respond(401));
    await pendingRuntime.init("u1");
    await pendingRuntime.sync();
    expect(pendingRuntime.getSnapshot().unauthorized).toBe(true);
    await pendingRuntime.init("u2");
    expect(pendingRuntime.getSnapshot()).toMatchObject({ ownerId: "u2", pending: [], discarded: [], unauthorized: false });
    fetchImpl.mockClear();
    await pendingRuntime.sync();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await store.list("u1")).toHaveLength(1);
  });

  it("keeps the unauthorized flag when init repeats for the same owner", async () => {
    await store.put({ ownerId: "u1", ...entry("a"), queuedAt: 1 });
    fetchImpl.mockResolvedValue(respond(401));
    await pendingRuntime.init("u1");
    await pendingRuntime.sync();
    await pendingRuntime.init("u1");
    expect(pendingRuntime.getSnapshot().unauthorized).toBe(true);
    expect(pendingRuntime.getSnapshot().pending).toHaveLength(1);
  });
});

describe("pendingRuntime sync", () => {
  it("does nothing without an owner", async () => {
    await pendingRuntime.sync();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(pendingRuntime.getSnapshot().syncVersion).toBe(0);
  });

  it("sends the queue, empties the snapshot and bumps syncVersion once", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    await pendingRuntime.enqueue(entry("b"));
    await pendingRuntime.sync();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(pendingRuntime.getSnapshot()).toMatchObject({ pending: [], unauthorized: false, syncVersion: 1 });
    expect(await store.list("u1")).toEqual([]);
  });

  it("does not bump syncVersion when nothing was synced or discarded", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.sync();
    await pendingRuntime.enqueue(entry("a"));
    fetchImpl.mockResolvedValue(respond(503));
    await pendingRuntime.sync();
    const snapshot = pendingRuntime.getSnapshot();
    expect(snapshot.syncVersion).toBe(0);
    expect(snapshot.pending).toHaveLength(1);
    expect(snapshot.unauthorized).toBe(false);
  });

  it("collects server-rejected changes as discarded, bumps syncVersion and keeps them until dismissed", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    fetchImpl.mockResolvedValue(respond(404));
    await pendingRuntime.sync();
    let snapshot = pendingRuntime.getSnapshot();
    expect(snapshot.discarded).toEqual([{ habitId: "a", date: "2026-11-06", status: 404 }]);
    expect(snapshot.pending).toEqual([]);
    expect(snapshot.syncVersion).toBe(1);
    await pendingRuntime.enqueue(entry("b"));
    fetchImpl.mockResolvedValue(respond(400));
    await pendingRuntime.sync();
    expect(pendingRuntime.getSnapshot().discarded).toHaveLength(2);
    pendingRuntime.dismissDiscarded();
    snapshot = pendingRuntime.getSnapshot();
    expect(snapshot.discarded).toEqual([]);
    expect(snapshot.syncVersion).toBe(2);
  });

  it("flags unauthorized on 401, keeps the queue, and clears the flag after a later successful sync", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    fetchImpl.mockResolvedValue(respond(401));
    await pendingRuntime.sync();
    expect(pendingRuntime.getSnapshot()).toMatchObject({ unauthorized: true, syncVersion: 0 });
    expect(pendingRuntime.getSnapshot().pending).toHaveLength(1);
    fetchImpl.mockResolvedValue(respond(200));
    await pendingRuntime.sync();
    expect(pendingRuntime.getSnapshot()).toMatchObject({ unauthorized: false, pending: [], syncVersion: 1 });
  });

  it("counts a run shared by simultaneous callers only once", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    await Promise.all([pendingRuntime.sync(), pendingRuntime.sync()]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(pendingRuntime.getSnapshot().syncVersion).toBe(1);
  });
});

describe("pendingRuntime forget and discardAll", () => {
  it("forget drops only that habit and date from store and snapshot", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    await pendingRuntime.enqueue(entry("b"));
    await pendingRuntime.enqueue(entry("a", "2026-11-05"));
    await pendingRuntime.forget("a", "2026-11-06");
    expect(keys(pendingRuntime.getSnapshot().pending)).toEqual(["b:2026-11-06", "a:2026-11-05"]);
    expect(keys(await store.list("u1"))).toEqual(["b:2026-11-06", "a:2026-11-05"]);
  });

  it("forget on a missing key is a no-op", async () => {
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    await pendingRuntime.forget("zzz", "2026-11-06");
    expect(pendingRuntime.getSnapshot().pending).toHaveLength(1);
  });

  it("discardAll clears the owner's store and snapshot but not other owners'", async () => {
    await store.put({ ownerId: "u2", ...entry("x"), queuedAt: 1 });
    await pendingRuntime.init("u1");
    await pendingRuntime.enqueue(entry("a"));
    await pendingRuntime.discardAll();
    expect(pendingRuntime.getSnapshot().pending).toEqual([]);
    expect(await store.list("u1")).toEqual([]);
    expect(await store.list("u2")).toHaveLength(1);
  });
});

describe("pendingRuntime without IndexedDB", () => {
  it("fails softly with the default store", async () => {
    vi.stubGlobal("indexedDB", undefined);
    configurePendingRuntime({ fetchImpl: asFetch(fetchImpl) });
    await expect(pendingRuntime.init("u1")).resolves.toBeUndefined();
    expect(pendingRuntime.getSnapshot()).toMatchObject({ ownerId: "u1", pending: [] });
    expect(await pendingRuntime.enqueue(entry("a"))).toBe(false);
    await expect(pendingRuntime.sync()).resolves.toBeUndefined();
    await expect(pendingRuntime.forget("a", "2026-11-06")).resolves.toBeUndefined();
    await expect(pendingRuntime.discardAll()).resolves.toBeUndefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
