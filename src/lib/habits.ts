import type { Habit } from "@/generated/prisma";
import type { CreateHabitInput } from "./validations";

export const habitSelect = {
  id: true, name: true, type: true, unit: true, frequency: true,
  userId: true, createdAt: true, updatedAt: true,
} as const;

type HabitDatabase = {
  user: { findUnique(args: { where: { id: string }; select: { id: true } }): Promise<{ id: string } | null> };
  habit: { create(args: {
    data: { name: string; type: "BINARY" | "NUMERIC"; unit: string | null; frequency: number[]; userId: string };
    select: typeof habitSelect;
  }): Promise<Habit> };
};

export async function requireHabitOwner(session: unknown, database: Pick<HabitDatabase, "user">): Promise<string | null> {
  if (!session || typeof session !== "object" || !("user" in session)) return null;
  const user = session.user;
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const id = user.id;
  if (typeof id !== "string" || !id.trim()) return null;
  const account = await database.user.findUnique({ where: { id }, select: { id: true } });
  return account ? id : null;
}

export async function createHabit(input: CreateHabitInput, ownerId: string, database: Pick<HabitDatabase, "habit">) {
  const habit = await database.habit.create({
    data: {
      name: input.name, type: input.type,
      unit: input.type === "NUMERIC" ? input.unit : null,
      frequency: input.frequency, userId: ownerId,
    },
    select: habitSelect,
  });
  return habitDto(habit);
}

function habitDto(habit: Habit) {
  return {
    id: habit.id, name: habit.name, type: habit.type, unit: habit.unit,
    frequency: habit.frequency, userId: habit.userId,
    createdAt: habit.createdAt, updatedAt: habit.updatedAt,
  };
}

type CatalogDatabase = {
  habit: {
    findMany(args: {
      where: { userId: string };
      orderBy: [{ createdAt: "desc" }, { id: "asc" }];
      select: typeof habitSelect;
    }): Promise<Habit[]>;
  };
};

export async function listHabitCatalog(ownerId: string, database: CatalogDatabase) {
  const habits = await database.habit.findMany({
    where: { userId: ownerId },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: habitSelect,
  });
  return habits.map(habitDto);
}
