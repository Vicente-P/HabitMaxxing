import { pendingLogKey, type PendingLog, type PendingLogStore } from "./types";

const DB_NAME = "hm-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-logs";

type StoredLog = PendingLog & { key: string };

function toPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function toPendingLog(stored: StoredLog): PendingLog {
  const { key, ...log } = stored;
  void key;
  return log;
}

/** IndexedDB-backed `PendingLogStore`. The database is opened lazily on first use. */
export function createIndexedDbPendingLogStore(): PendingLogStore {
  let opening: Promise<IDBDatabase> | null = null;

  function open(): Promise<IDBDatabase> {
    opening ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("ownerId", "ownerId");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      opening = null;
      throw error;
    });
    return opening;
  }

  return {
    async put(log) {
      const tx = (await open()).transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ key: pendingLogKey(log), ...log } satisfies StoredLog);
      await transactionDone(tx);
    },
    async remove(log) {
      const tx = (await open()).transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const key = pendingLogKey(log);
      const done = transactionDone(tx);
      const stored = (await toPromise(store.get(key))) as StoredLog | undefined;
      if (stored?.queuedAt === log.queuedAt) store.delete(key);
      await done;
    },
    async list(ownerId) {
      const tx = (await open()).transaction(STORE_NAME, "readonly");
      const stored = (await toPromise(tx.objectStore(STORE_NAME).index("ownerId").getAll(ownerId))) as StoredLog[];
      return stored.sort((a, b) => a.queuedAt - b.queuedAt).map(toPendingLog);
    },
    async clear(ownerId) {
      const tx = (await open()).transaction(STORE_NAME, "readwrite");
      const request = tx.objectStore(STORE_NAME).index("ownerId").openKeyCursor(IDBKeyRange.only(ownerId));
      const store = tx.objectStore(STORE_NAME);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        store.delete(cursor.primaryKey);
        cursor.continue();
      };
      await transactionDone(tx);
    },
  };
}
