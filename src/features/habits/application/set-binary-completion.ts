import type { SavedHabitLog } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";
import { resolveLoggableHabit, type LoggableHabitError } from "./resolve-loggable-habit";

export type SetBinaryCompletionInput = {
  ownerId: string;
  habitId: string;
  completed: boolean;
  /** Valid YYYY-MM-DD date; defaults to the current UTC date. */
  date?: string;
};

export type SetBinaryCompletionError = LoggableHabitError;

export type SetBinaryCompletionResult =
  | { ok: true; log: SavedHabitLog }
  | { ok: false; error: SetBinaryCompletionError };

/**
 * Marks a binary habit as completed or pending for a day. Reverting updates the log to
 * `completed: false` (one row per habit and day, never deleted). A numeric habit is a `TYPE_MISMATCH`.
 */
export async function setBinaryCompletion(
  input: SetBinaryCompletionInput,
  repository: Pick<HabitRepository, "findById" | "upsertBinaryLog">,
  now: Date = new Date(),
): Promise<SetBinaryCompletionResult> {
  const resolved = await resolveLoggableHabit({ ...input, type: "BINARY" }, repository, now);
  if (!resolved.ok) return resolved;
  const log = await repository.upsertBinaryLog(resolved.habit.id, resolved.date, input.completed);
  return { ok: true, log };
}
