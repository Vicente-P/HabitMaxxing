export type HabitType = "BINARY" | "NUMERIC";

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  unit: string | null;
  frequency: number[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewHabit = {
  name: string;
  type: HabitType;
  unit: string | null;
  frequency: number[];
  ownerId: string;
};

/** A completion record for one habit on one calendar day (`date` is YYYY-MM-DD). */
export type HabitLog = {
  id: string;
  completed: boolean;
  value: number | null;
  date: string;
};

export type ScheduledHabit = Habit & { log: HabitLog | null };
