export type LogPayload = { completed: boolean } | { value: number };

export type PendingLog = {
  ownerId: string;
  habitId: string;
  date: string;
  payload: LogPayload;
  queuedAt: number;
};

export interface PendingLogStore {
  /** Inserts or replaces the record with the same ownerId+habitId+date (last write wins). */
  put(log: PendingLog): Promise<void>;
  /** Removes the record only if the stored one still has the same queuedAt (a newer write must survive). */
  remove(log: PendingLog): Promise<void>;
  /** Pending records of one owner, oldest queuedAt first. */
  list(ownerId: string): Promise<PendingLog[]>;
  /** Removes every record of one owner. */
  clear(ownerId: string): Promise<void>;
}

export const pendingLogKey = (log: Pick<PendingLog, "ownerId" | "habitId" | "date">) =>
  `${log.ownerId}:${log.habitId}:${log.date}`;
