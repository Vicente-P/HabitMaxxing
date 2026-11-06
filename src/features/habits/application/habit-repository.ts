import type { Habit, HabitChanges, NewHabit, SavedHabitLog, ScheduledHabit } from "../domain/habit";

/** Port: persistence of habits. Implementations own all storage-specific query shapes. */
export interface HabitRepository {
  create(habit: NewHabit): Promise<Habit>;
  /** All habits of the owner, newest first, then by id. */
  listByOwner(ownerId: string): Promise<Habit[]>;
  /** Habits of the owner scheduled on `day` (0 = Sunday), each with its log for `logDate` (YYYY-MM-DD), same ordering. */
  listScheduledForDay(ownerId: string, day: number, logDate: string): Promise<ScheduledHabit[]>;
  /** The habit with this id regardless of owner (`userId` identifies the owner), or null when it does not exist. */
  findById(habitId: string): Promise<Habit | null>;
  /** Date (YYYY-MM-DD) and completed flag of every log of the habit, oldest first; empty when it has none or does not exist. */
  listLogDays(habitId: string): Promise<Array<{ date: string; completed: boolean }>>;
  /** Applies `changes` to the habit only when `ownerId` owns it; null when it is foreign or missing. Logs are untouched. */
  update(habitId: string, ownerId: string, changes: HabitChanges): Promise<Habit | null>;
  /** Distinct weekdays (0 = Sunday), sorted ascending, on which the habit has any log. */
  loggedWeekdays(habitId: string): Promise<number[]>;
  /** Creates or updates the single binary log of the habit on `date` (YYYY-MM-DD) with `completed`; never deletes. */
  upsertBinaryLog(habitId: string, date: string, completed: boolean): Promise<SavedHabitLog>;
  /** Creates or replaces the single numeric log of the habit on `date` (YYYY-MM-DD) with `completed: true` and `value`. */
  upsertNumericLog(habitId: string, date: string, value: number): Promise<SavedHabitLog>;
}
