import { createIndexedDbPendingLogStore } from "./indexeddb-store";
import { syncPendingLogs, type DiscardedLog, type SyncResult } from "./sync";
import type { PendingLog, PendingLogStore } from "./types";

export type PendingSnapshot = {
  ownerId: string | null;
  pending: readonly PendingLog[];
  discarded: readonly DiscardedLog[];
  unauthorized: boolean;
  syncVersion: number;
};

const emptySnapshot: PendingSnapshot = { ownerId: null, pending: [], discarded: [], unauthorized: false, syncVersion: 0 };

/** Store used when IndexedDB is unavailable: reads are empty and writes fail, never throw synchronously. */
const unavailableStore: PendingLogStore = {
  async put() { throw new Error("IndexedDB is unavailable"); },
  async remove() {},
  async list() { return []; },
  async clear() {},
};

let snapshot: PendingSnapshot = emptySnapshot;
let injectedStore: PendingLogStore | undefined;
let defaultStore: PendingLogStore | undefined;
let fetchImpl: typeof fetch | undefined;
let lastQueuedAt = 0;
let handledRuns = new WeakSet<SyncResult>();
const listeners = new Set<() => void>();

function getStore(): PendingLogStore {
  if (injectedStore) return injectedStore;
  if (typeof indexedDB === "undefined") return unavailableStore;
  defaultStore ??= createIndexedDbPendingLogStore();
  return defaultStore;
}

function update(next: Partial<PendingSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

async function readQueue(ownerId: string): Promise<PendingLog[]> {
  try {
    return await getStore().list(ownerId);
  } catch {
    return [];
  }
}

const sortByQueuedAt = (logs: readonly PendingLog[]) => [...logs].sort((a, b) => a.queuedAt - b.queuedAt);

export const pendingRuntime = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },

  getSnapshot(): PendingSnapshot {
    return snapshot;
  },

  async init(ownerId: string): Promise<void> {
    if (snapshot.ownerId !== ownerId) {
      update({ ownerId, pending: [], discarded: [], unauthorized: false });
    }
    const pending = await readQueue(ownerId);
    if (snapshot.ownerId === ownerId) update({ pending });
  },

  async enqueue(log: Omit<PendingLog, "queuedAt" | "ownerId">): Promise<boolean> {
    const ownerId = snapshot.ownerId;
    if (!ownerId) return false;
    const record: PendingLog = { ...log, ownerId, queuedAt: Math.max(Date.now(), lastQueuedAt + 1) };
    try {
      await getStore().put(record);
    } catch {
      return false;
    }
    lastQueuedAt = record.queuedAt;
    if (snapshot.ownerId === ownerId) {
      const others = snapshot.pending.filter((item) => !(item.habitId === record.habitId && item.date === record.date));
      update({ pending: sortByQueuedAt([...others, record]) });
    }
    return true;
  },

  async forget(habitId: string, date: string): Promise<void> {
    const ownerId = snapshot.ownerId;
    if (!ownerId) return;
    try {
      const store = getStore();
      const matches = (await store.list(ownerId)).filter((item) => item.habitId === habitId && item.date === date);
      for (const match of matches) await store.remove(match);
    } catch {
      // Soft failure: the snapshot is still cleaned below.
    }
    if (snapshot.ownerId === ownerId && snapshot.pending.some((item) => item.habitId === habitId && item.date === date)) {
      update({ pending: snapshot.pending.filter((item) => !(item.habitId === habitId && item.date === date)) });
    }
  },

  async sync(): Promise<void> {
    const ownerId = snapshot.ownerId;
    if (!ownerId) return;
    let result: SyncResult;
    try {
      result = await syncPendingLogs({ ownerId, store: getStore(), fetchImpl });
    } catch {
      return;
    }
    const pending = await readQueue(ownerId);
    if (snapshot.ownerId !== ownerId) return;
    const firstToHandle = !handledRuns.has(result);
    handledRuns.add(result);
    const changed = result.synced > 0 || result.discarded.length > 0;
    update({
      pending,
      unauthorized: result.unauthorized,
      ...(firstToHandle ? {
        discarded: [...snapshot.discarded, ...result.discarded],
        syncVersion: snapshot.syncVersion + (changed ? 1 : 0),
      } : {}),
    });
  },

  dismissDiscarded(): void {
    if (snapshot.discarded.length > 0) update({ discarded: [] });
  },

  async discardAll(): Promise<void> {
    const ownerId = snapshot.ownerId;
    if (!ownerId) return;
    try {
      await getStore().clear(ownerId);
    } catch {
      // Soft failure: nothing else to do locally.
    }
    if (snapshot.ownerId === ownerId) update({ pending: [] });
  },
};

/** Test hook: swaps the store/fetch and resets every piece of runtime state. */
export function configurePendingRuntime(options: { store?: PendingLogStore; fetchImpl?: typeof fetch }): void {
  injectedStore = options.store;
  defaultStore = undefined;
  fetchImpl = options.fetchImpl;
  lastQueuedAt = 0;
  handledRuns = new WeakSet();
  snapshot = emptySnapshot;
  listeners.forEach((listener) => listener());
}
