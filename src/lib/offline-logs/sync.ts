import type { PendingLog, PendingLogStore } from "./types";

export type DiscardedLog = { habitId: string; date: string; status: 400 | 404 };
export type SyncResult = { synced: number; discarded: DiscardedLog[]; remaining: number; unauthorized: boolean };

const inFlight = new Map<string, Promise<SyncResult>>();

type SendOutcome = "synced" | "discard-400" | "discard-404" | "unauthorized" | "retry-later";

async function send(log: PendingLog, fetchImpl: typeof fetch): Promise<SendOutcome> {
  try {
    const response = await fetchImpl(`/api/habits/${encodeURIComponent(log.habitId)}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: log.date, ...log.payload }),
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 200) return "synced";
    if (response.status === 400) return "discard-400";
    if (response.status === 404) return "discard-404";
    if (response.status === 401) return "unauthorized";
    return "retry-later";
  } catch {
    return "retry-later";
  }
}

async function run(ownerId: string, store: PendingLogStore, fetchImpl: typeof fetch): Promise<SyncResult> {
  let synced = 0;
  let unauthorized = false;
  const discarded: DiscardedLog[] = [];

  for (const log of await store.list(ownerId)) {
    const outcome = await send(log, fetchImpl);
    if (outcome === "synced") {
      await store.remove(log);
      synced++;
    } else if (outcome === "discard-400" || outcome === "discard-404") {
      await store.remove(log);
      discarded.push({ habitId: log.habitId, date: log.date, status: outcome === "discard-400" ? 400 : 404 });
    } else {
      unauthorized = outcome === "unauthorized";
      break;
    }
  }

  return { synced, discarded, remaining: (await store.list(ownerId)).length, unauthorized };
}

/** Replays the pending logs of one owner, oldest first. Simultaneous calls share one run. */
export function syncPendingLogs(input: {
  ownerId: string;
  store: PendingLogStore;
  fetchImpl?: typeof fetch;
}): Promise<SyncResult> {
  const running = inFlight.get(input.ownerId);
  if (running) return running;

  const promise = run(input.ownerId, input.store, input.fetchImpl ?? ((...args) => fetch(...args))).finally(() => {
    inFlight.delete(input.ownerId);
  });
  inFlight.set(input.ownerId, promise);
  return promise;
}
