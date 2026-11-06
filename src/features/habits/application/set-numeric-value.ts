import type { SavedHabitLog } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";
import { resolveLoggableHabit, type LoggableHabitError } from "./resolve-loggable-habit";

export type SetNumericValueInput = {
  ownerId: string;
  habitId: string;
  /** Finite number greater than 0 (validated at the boundary). */
  value: number;
  /** Valid YYYY-MM-DD date; defaults to the current UTC date. */
  date?: string;
};

export type SetNumericValueError = LoggableHabitError;

export type SetNumericValueResult =
  | { ok: true; log: SavedHabitLog }
  | { ok: false; error: SetNumericValueError };

/**
 * Registers the value of a numeric habit for a day as a completed log. A second value for the same
 * day replaces the previous one (one row per habit and day). A binary habit is a `TYPE_MISMATCH`.
 */
export async function setNumericValue(
  input: SetNumericValueInput,
  repository: Pick<HabitRepository, "findById" | "upsertNumericLog">,
  now: Date = new Date(),
): Promise<SetNumericValueResult> {
  const resolved = await resolveLoggableHabit({ ...input, type: "NUMERIC" }, repository, now);
  if (!resolved.ok) return resolved;
  const log = await repository.upsertNumericLog(resolved.habit.id, resolved.date, input.value);
  return { ok: true, log };
}
