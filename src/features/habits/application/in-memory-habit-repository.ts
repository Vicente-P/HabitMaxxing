import type { Habit, HabitLog, NewHabit, SavedHabitLog, ScheduledHabit } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

type StoredLog = HabitLog & { createdAt?: Date };
type Stored = Habit & { logs: StoredLog[] };

/** Test double that applies the repository contract: owner scoping, weekday filter, per-date log, ordering. */
export class InMemoryHabitRepository implements HabitRepository {
  readonly habits: Stored[] = [];
  failWith: Error | null = null;
  private sequence = 0;

  seed(habit: Habit, logs: HabitLog[] = []) {
    this.habits.push({ ...habit, logs });
  }

  async create(input: NewHabit): Promise<Habit> {
    this.throwIfFailing();
    this.sequence += 1;
    const now = new Date(this.sequence * 1000);
    const habit: Habit = {
      id: `habit-${this.sequence}`, name: input.name, type: input.type, unit: input.unit,
      frequency: input.frequency, userId: input.ownerId, createdAt: now, updatedAt: now,
    };
    this.habits.push({ ...habit, logs: [] });
    return habit;
  }

  async listByOwner(ownerId: string): Promise<Habit[]> {
    this.throwIfFailing();
    return this.ordered(ownerId).map((stored) => this.toHabit(stored));
  }

  async listScheduledForDay(ownerId: string, day: number, logDate: string): Promise<ScheduledHabit[]> {
    this.throwIfFailing();
    return this.ordered(ownerId)
      .filter((habit) => habit.frequency.includes(day))
      .map((stored) => ({ ...this.toHabit(stored), log: stored.logs.find((log) => log.date === logDate) ?? null }));
  }

  async findById(habitId: string): Promise<Habit | null> {
    this.throwIfFailing();
    const stored = this.habits.find((habit) => habit.id === habitId);
    return stored ? this.toHabit(stored) : null;
  }

  async upsertBinaryLog(habitId: string, date: string, completed: boolean): Promise<SavedHabitLog> {
    this.throwIfFailing();
    const stored = this.habits.find((habit) => habit.id === habitId);
    if (!stored) throw new Error(`Unknown habit ${habitId}`);
    const existing = stored.logs.find((log) => log.date === date);
    if (existing) {
      existing.completed = completed;
      return this.toSavedLog(habitId, existing);
    }
    this.sequence += 1;
    const log: StoredLog = { id: `log-${this.sequence}`, completed, value: null, date, createdAt: new Date(this.sequence * 1000) };
    stored.logs.push(log);
    return this.toSavedLog(habitId, log);
  }

  private toSavedLog(habitId: string, log: StoredLog): SavedHabitLog {
    return { id: log.id, habitId, date: log.date, completed: log.completed, value: log.value, createdAt: log.createdAt ?? new Date(0) };
  }

  private toHabit(stored: Stored): Habit {
    return {
      id: stored.id, name: stored.name, type: stored.type, unit: stored.unit,
      frequency: stored.frequency, userId: stored.userId, createdAt: stored.createdAt, updatedAt: stored.updatedAt,
    };
  }

  private ordered(ownerId: string) {
    return this.habits
      .filter((habit) => habit.userId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id));
  }

  private throwIfFailing() {
    if (this.failWith) throw this.failWith;
  }
}
