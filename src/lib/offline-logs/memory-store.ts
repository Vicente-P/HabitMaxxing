import { pendingLogKey, type PendingLog, type PendingLogStore } from "./types";

const copy = (log: PendingLog): PendingLog => ({ ...log, payload: { ...log.payload } });

/** In-memory `PendingLogStore`, used by unit tests. */
export function createMemoryPendingLogStore(): PendingLogStore {
  const records = new Map<string, PendingLog>();

  return {
    async put(log) {
      records.set(pendingLogKey(log), copy(log));
    },
    async remove(log) {
      const key = pendingLogKey(log);
      if (records.get(key)?.queuedAt === log.queuedAt) records.delete(key);
    },
    async list(ownerId) {
      return [...records.values()]
        .filter((record) => record.ownerId === ownerId)
        .sort((a, b) => a.queuedAt - b.queuedAt)
        .map(copy);
    },
    async clear(ownerId) {
      for (const [key, record] of records) {
        if (record.ownerId === ownerId) records.delete(key);
      }
    },
  };
}
