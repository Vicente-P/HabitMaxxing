import type { Habit } from "../domain/habit";
import type { UpdateHabitInput } from "../domain/update-habit-schema";
import type { HabitRepository } from "./habit-repository";

export type UpdateHabitError = "NOT_FOUND" | "UNIT_NOT_ALLOWED" | "UNIT_REQUIRED";

export type UpdateHabitResult =
  | { ok: true; habit: Habit; removedDaysWithLogs: number[] }
  | { ok: false; error: UpdateHabitError };

/**
 * HU-07: partially updates the owner's habit. A foreign habit looks like a missing one. The unit must fit
 * the stored type (binary habits have none, numeric habits need one). Logs are never deleted; the result
 * lists the weekdays removed from the frequency on which the habit already has logs, so callers can warn.
 */
export async function updateHabit(
  input: { ownerId: string; habitId: string; changes: UpdateHabitInput },
  repository: Pick<HabitRepository, "findById" | "update" | "loggedWeekdays">,
): Promise<UpdateHabitResult> {
  const { changes } = input;
  const habit = await repository.findById(input.habitId);
  if (!habit || habit.userId !== input.ownerId) return { ok: false, error: "NOT_FOUND" };
  if (changes.unit !== undefined) {
    if (habit.type === "BINARY" && changes.unit !== null) return { ok: false, error: "UNIT_NOT_ALLOWED" };
    if (habit.type === "NUMERIC" && !changes.unit) return { ok: false, error: "UNIT_REQUIRED" };
  }

  const updated = await repository.update(habit.id, input.ownerId, changes);
  if (!updated) return { ok: false, error: "NOT_FOUND" };

  const nextFrequency = changes.frequency;
  const removed = nextFrequency ? habit.frequency.filter((day) => !nextFrequency.includes(day)) : [];
  if (removed.length === 0) return { ok: true, habit: updated, removedDaysWithLogs: [] };
  const logged = await repository.loggedWeekdays(habit.id);
  return { ok: true, habit: updated, removedDaysWithLogs: removed.filter((day) => logged.includes(day)).sort((a, b) => a - b) };
}
