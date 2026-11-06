import { utcToday } from "../domain/calendar-date";
import type { Habit } from "../domain/habit";
import { calculateStreak, type Streak } from "../domain/streak";
import type { HabitRepository } from "./habit-repository";

export type HabitStreakResult = { ok: true; habit: Habit; streak: Streak } | { ok: false; error: "NOT_FOUND" };

/** HU-12: the owner's habit with its current streak as of `now` (UTC). A foreign habit looks like a missing one. */
export async function getHabitStreak(
  input: { ownerId: string; habitId: string },
  repository: Pick<HabitRepository, "findById" | "listLogDays">,
  now: Date,
): Promise<HabitStreakResult> {
  const habit = await repository.findById(input.habitId);
  if (!habit || habit.userId !== input.ownerId) return { ok: false, error: "NOT_FOUND" };
  const logs = await repository.listLogDays(habit.id);
  return { ok: true, habit, streak: calculateStreak(logs, habit.frequency, utcToday(now)) };
}
