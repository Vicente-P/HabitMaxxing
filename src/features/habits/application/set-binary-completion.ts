import { isFutureDate, utcToday, weekdayOf } from "../domain/calendar-date";
import type { SavedHabitLog } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export type SetBinaryCompletionInput = {
  ownerId: string;
  habitId: string;
  completed: boolean;
  /** Valid YYYY-MM-DD date; defaults to the current UTC date. */
  date?: string;
};

export type SetBinaryCompletionError = "NOT_FOUND" | "FORBIDDEN" | "NUMERIC_NOT_SUPPORTED" | "FUTURE_DATE" | "NOT_SCHEDULED";

export type SetBinaryCompletionResult =
  | { ok: true; log: SavedHabitLog }
  | { ok: false; error: SetBinaryCompletionError };

/**
 * Marks a binary habit as completed or pending for a day. Reverting updates the log to
 * `completed: false` (one row per habit and day, never deleted).
 */
export async function setBinaryCompletion(
  input: SetBinaryCompletionInput,
  repository: Pick<HabitRepository, "findById" | "upsertBinaryLog">,
  now: Date = new Date(),
): Promise<SetBinaryCompletionResult> {
  const habit = await repository.findById(input.habitId);
  if (!habit) return { ok: false, error: "NOT_FOUND" };
  if (habit.userId !== input.ownerId) return { ok: false, error: "FORBIDDEN" };
  if (habit.type !== "BINARY") return { ok: false, error: "NUMERIC_NOT_SUPPORTED" };

  const today = utcToday(now);
  const date = input.date ?? today;
  if (isFutureDate(date, today)) return { ok: false, error: "FUTURE_DATE" };
  if (!habit.frequency.includes(weekdayOf(date))) return { ok: false, error: "NOT_SCHEDULED" };

  const log = await repository.upsertBinaryLog(habit.id, date, input.completed);
  return { ok: true, log };
}
