import type { Habit, HabitLog } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export type DailyHabit = Habit & { todayLog: HabitLog | null };

export async function listDailyHabits(
  ownerId: string,
  day: number,
  date: string,
  repository: Pick<HabitRepository, "listScheduledForDay">,
): Promise<{ data: DailyHabit[]; meta: { day: number; date: string; total: number } }> {
  const habits = await repository.listScheduledForDay(ownerId, day, date);
  return {
    data: habits.map(({ log, ...habit }) => ({ ...habit, todayLog: log })),
    meta: { day, date, total: habits.length },
  };
}
