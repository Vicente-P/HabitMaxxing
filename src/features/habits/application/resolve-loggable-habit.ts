import { isFutureDate, utcToday, weekdayOf } from "../domain/calendar-date";
import type { Habit, HabitType } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export type LoggableHabitError = "NOT_FOUND" | "TYPE_MISMATCH" | "FUTURE_DATE" | "NOT_SCHEDULED";

export type LoggableHabitResult =
  | { ok: true; habit: Habit; date: string }
  | { ok: false; error: LoggableHabitError };

/**
 * Shared HU-10/HU-11 checks before writing a log: ownership (a foreign habit looks like a missing one),
 * habit type, no future dates and a scheduled weekday. `date` defaults to the current UTC date.
 */
export async function resolveLoggableHabit(
  input: { ownerId: string; habitId: string; type: HabitType; date?: string },
  repository: Pick<HabitRepository, "findById">,
  now: Date,
): Promise<LoggableHabitResult> {
  const habit = await repository.findById(input.habitId);
  if (!habit || habit.userId !== input.ownerId) return { ok: false, error: "NOT_FOUND" };
  if (habit.type !== input.type) return { ok: false, error: "TYPE_MISMATCH" };

  const today = utcToday(now);
  const date = input.date ?? today;
  if (isFutureDate(date, today)) return { ok: false, error: "FUTURE_DATE" };
  if (!habit.frequency.includes(weekdayOf(date))) return { ok: false, error: "NOT_SCHEDULED" };
  return { ok: true, habit, date };
}
