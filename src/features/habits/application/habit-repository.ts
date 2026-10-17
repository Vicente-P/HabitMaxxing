import type { Habit, NewHabit, ScheduledHabit } from "../domain/habit";

/** Port: persistence of habits. Implementations own all storage-specific query shapes. */
export interface HabitRepository {
  create(habit: NewHabit): Promise<Habit>;
  /** All habits of the owner, newest first, then by id. */
  listByOwner(ownerId: string): Promise<Habit[]>;
  /** Habits of the owner scheduled on `day` (0 = Sunday), each with its log for `logDate` (YYYY-MM-DD), same ordering. */
  listScheduledForDay(ownerId: string, day: number, logDate: string): Promise<ScheduledHabit[]>;
}
