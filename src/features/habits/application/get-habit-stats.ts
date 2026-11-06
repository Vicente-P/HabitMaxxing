import { utcToday } from "../domain/calendar-date";
import { calculateCompletion, type Completion } from "../domain/completion";
import type { Habit } from "../domain/habit";
import { currentMonth } from "../domain/month";
import { calculateStreak, type Streak } from "../domain/streak";
import type { HabitRepository } from "./habit-repository";

export type HabitStatsResult =
  | { ok: true; habit: Habit; month: string; streak: Streak; completion: Completion }
  | { ok: false; error: "NOT_FOUND" };

/**
 * HU-12/HU-14: the owner's habit with its streak (always as of `now`, UTC) and the completion of `month`
 * (a valid `YYYY-MM`, default the current UTC month). A foreign habit looks like a missing one.
 */
export async function getHabitStats(
  input: { ownerId: string; habitId: string; month?: string },
  repository: Pick<HabitRepository, "findById" | "listLogDays">,
  now: Date,
): Promise<HabitStatsResult> {
  const habit = await repository.findById(input.habitId);
  if (!habit || habit.userId !== input.ownerId) return { ok: false, error: "NOT_FOUND" };
  const logs = await repository.listLogDays(habit.id);
  const today = utcToday(now);
  const month = input.month ?? currentMonth(now);
  return {
    ok: true, habit, month,
    streak: calculateStreak(logs, habit.frequency, today),
    completion: calculateCompletion(logs, habit.frequency, month, today, utcToday(habit.createdAt)),
  };
}
