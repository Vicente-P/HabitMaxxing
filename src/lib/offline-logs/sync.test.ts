import { describe, expect, it, vi } from "vitest";
import { createMemoryPendingLogStore } from "./memory-store";
import { syncPendingLogs } from "./sync";
import type { PendingLog, PendingLogStore } from "./types";

const log = (overrides: Partial<PendingLog> = {}): PendingLog => ({
  ownerId: "u1",
  habitId: "h1",
  date: "2026-11-06",
  payload: { completed: true },
  queuedAt: 1,
  ...overrides,
});

const respond = (status: number) => new Response(null, { status });

async function seed(...logs: PendingLog[]) {
  const store = createMemoryPendingLogStore();
  for (const entry of logs) await store.put(entry);
  return store;
}

const asFetch = (mock: unknown) => mock as typeof fetch;

describe("syncPendingLogs", () => {
  it("sends records oldest first, one at a time, with the agenda request options", async () => {
    const store = await seed(
      log({ habitId: "b/2", payload: { value: 3 }, queuedAt: 20 }),
      log({ habitId: "a", queuedAt: 10 }),
    );
    let inFlight = 0;
    let maxInFlight = 0;
    const fetchImpl = vi.fn(async (...args: unknown[]) => {
      void args;
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight--;
      return respond(200);
    });

    await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });

    expect(maxInFlight).toBe(1);
    expect(fetchImpl.mock.calls).toEqual([
      ["/api/habits/a/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-11-06", completed: true }),
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
      }],
      ["/api/habits/b%2F2/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-11-06", value: 3 }),
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
      }],
    ]);
  });

  it("removes records answered with 200 and counts them as synced", async () => {
    const store = await seed(log({ queuedAt: 1 }), log({ habitId: "h2", queuedAt: 2 }));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(vi.fn(async () => respond(200))) });
    expect(result).toEqual({ synced: 2, discarded: [], remaining: 0, unauthorized: false });
    expect(await store.list("u1")).toEqual([]);
  });

  it.each([400, 404] as const)("discards a record rejected with %i and keeps going", async (status) => {
    const store = await seed(log({ habitId: "bad", queuedAt: 1 }), log({ habitId: "good", queuedAt: 2 }));
    const fetchImpl = vi.fn(async (url: string) => respond(url.includes("/bad/") ? status : 200));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({
      synced: 1,
      discarded: [{ habitId: "bad", date: "2026-11-06", status }],
      remaining: 0,
      unauthorized: false,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(await store.list("u1")).toEqual([]);
  });

  it("keeps the record, stops and flags unauthorized on 401", async () => {
    const store = await seed(log({ habitId: "a", queuedAt: 1 }), log({ habitId: "b", queuedAt: 2 }));
    const fetchImpl = vi.fn(async () => respond(401));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({ synced: 0, discarded: [], remaining: 2, unauthorized: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(await store.list("u1")).toHaveLength(2);
  });

  it("keeps the record and stops when fetch throws", async () => {
    const store = await seed(log({ habitId: "a", queuedAt: 1 }), log({ habitId: "b", queuedAt: 2 }));
    const fetchImpl = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({ synced: 0, discarded: [], remaining: 2, unauthorized: false });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([500, 503, 429, 403, 302])("keeps the record and stops on status %i", async (status) => {
    const store = await seed(log({ habitId: "a", queuedAt: 1 }), log({ habitId: "b", queuedAt: 2 }));
    const fetchImpl = vi.fn(async () => respond(status));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({ synced: 0, discarded: [], remaining: 2, unauthorized: false });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("preserves what already synced when a later record fails", async () => {
    const store = await seed(
      log({ habitId: "a", queuedAt: 1 }),
      log({ habitId: "b", queuedAt: 2 }),
      log({ habitId: "c", queuedAt: 3 }),
    );
    const fetchImpl = vi.fn(async (url: string) => respond(url.includes("/b/") ? 500 : 200));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({ synced: 1, discarded: [], remaining: 2, unauthorized: false });
    expect((await store.list("u1")).map((entry) => entry.habitId)).toEqual(["b", "c"]);
  });

  it("only sends and counts the records of the given owner", async () => {
    const other = log({ ownerId: "u2", habitId: "other", queuedAt: 2 });
    const store = await seed(log({ ownerId: "u1", queuedAt: 1 }), other);
    const fetchImpl = vi.fn(async () => respond(200));
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result.remaining).toBe(0);
    expect(await store.list("u2")).toEqual([other]);
  });

  it("does not send the same record twice for simultaneous calls of one owner", async () => {
    const store = await seed(log());
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const fetchImpl = vi.fn(async () => { await gate; return respond(200); });

    const first = syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    const second = syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    release();
    const [a, b] = await Promise.all([first, second]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(a).toEqual({ synced: 1, discarded: [], remaining: 0, unauthorized: false });
    expect(b).toEqual(a);
  });

  it("allows a new run once the previous one finished", async () => {
    const store = await seed(log());
    const fetchImpl = vi.fn(async () => respond(500));
    await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("keeps a record replaced by a newer write while the older version was being sent", async () => {
    const store: PendingLogStore = await seed(log({ queuedAt: 1 }));
    const newer = log({ payload: { completed: false }, queuedAt: 2 });
    const fetchImpl = vi.fn(async () => { await store.put(newer); return respond(200); });
    const result = await syncPendingLogs({ ownerId: "u1", store, fetchImpl: asFetch(fetchImpl) });
    expect(result).toEqual({ synced: 1, discarded: [], remaining: 1, unauthorized: false });
    expect(await store.list("u1")).toEqual([newer]);
  });

  it("defaults to the global fetch", async () => {
    const store = await seed(log());
    const globalFetch = vi.fn(async () => respond(200));
    vi.stubGlobal("fetch", globalFetch);
    try {
      const result = await syncPendingLogs({ ownerId: "u1", store });
      expect(globalFetch).toHaveBeenCalledTimes(1);
      expect(result.synced).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
