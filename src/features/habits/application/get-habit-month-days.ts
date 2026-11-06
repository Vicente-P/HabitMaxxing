import { utcToday } from "../domain/calendar-date";
import type { Habit } from "../domain/habit";
import { currentMonth } from "../domain/month";
import { buildMonthDays, monthRange, type MonthDay } from "../domain/month-days";
import type { HabitRepository } from "./habit-repository";

export type HabitMonthDaysResult =
  | { ok: true; habit: Habit; month: string; days: MonthDay[] }
  | { ok: false; error: "NOT_FOUND" };

/**
 * HU-13: the owner's habit with the status of every day of `month` (a valid `YYYY-MM`, default the current UTC month)
 * as of `now`. A foreign habit looks like a missing one.
 */
export async function getHabitMonthDays(
  input: { ownerId: string; habitId: string; month?: string },
  repository: Pick<HabitRepository, "findById" | "listLogsInRange">,
  now: Date,
): Promise<HabitMonthDaysResult> {
  const habit = await repository.findById(input.habitId);
  if (!habit || habit.userId !== input.ownerId) return { ok: false, error: "NOT_FOUND" };
  const month = input.month ?? currentMonth(now);
  const { from, to } = monthRange(month);
  const logs = await repository.listLogsInRange(habit.id, from, to);
  return { ok: true, habit, month, days: buildMonthDays(logs, habit.frequency, month, utcToday(now), utcToday(habit.createdAt)) };
}
