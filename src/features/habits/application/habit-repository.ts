import type { Habit, NewHabit, SavedHabitLog, ScheduledHabit } from "../domain/habit";

/** Port: persistence of habits. Implementations own all storage-specific query shapes. */
export interface HabitRepository {
  create(habit: NewHabit): Promise<Habit>;
  /** All habits of the owner, newest first, then by id. */
  listByOwner(ownerId: string): Promise<Habit[]>;
  /** Habits of the owner scheduled on `day` (0 = Sunday), each with its log for `logDate` (YYYY-MM-DD), same ordering. */
  listScheduledForDay(ownerId: string, day: number, logDate: string): Promise<ScheduledHabit[]>;
  /** The habit with this id regardless of owner (`userId` identifies the owner), or null when it does not exist. */
  findById(habitId: string): Promise<Habit | null>;
  /** Creates or updates the single binary log of the habit on `date` (YYYY-MM-DD) with `completed`; never deletes. */
  upsertBinaryLog(habitId: string, date: string, completed: boolean): Promise<SavedHabitLog>;
}
