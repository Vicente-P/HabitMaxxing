import type { PrismaClient } from "@/generated/prisma";
import type { HabitRepository } from "../application/habit-repository";
import type { Habit } from "../domain/habit";

const habitSelect = {
  id: true, name: true, type: true, unit: true, frequency: true,
  userId: true, createdAt: true, updatedAt: true,
} as const;

const logSelect = { id: true, completed: true, value: true, date: true } as const;

const newestFirst = [{ createdAt: "desc" }, { id: "asc" }] as [{ createdAt: "desc" }, { id: "asc" }];

function toHabit(row: Habit): Habit {
  return {
    id: row.id, name: row.name, type: row.type, unit: row.unit,
    frequency: row.frequency, userId: row.userId,
    createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
}

const savedLogSelect = { id: true, habitId: true, date: true, completed: true, value: true, createdAt: true } as const;

export function createPrismaHabitRepository(database: Pick<PrismaClient, "habit" | "habitLog">): HabitRepository {
  return {
    async create(habit) {
      const row = await database.habit.create({
        data: {
          name: habit.name, type: habit.type, unit: habit.unit,
          frequency: habit.frequency, userId: habit.ownerId,
        },
        select: habitSelect,
      });
      return toHabit(row);
    },

    async listByOwner(ownerId) {
      const rows = await database.habit.findMany({
        where: { userId: ownerId },
        orderBy: newestFirst,
        select: habitSelect,
      });
      return rows.map(toHabit);
    },

    async findById(habitId) {
      const row = await database.habit.findUnique({ where: { id: habitId }, select: habitSelect });
      return row ? toHabit(row) : null;
    },

    async upsertBinaryLog(habitId, date, completed) {
      const day = new Date(`${date}T00:00:00.000Z`);
      const row = await database.habitLog.upsert({
        where: { habitId_date: { habitId, date: day } },
        create: { habitId, date: day, completed },
        update: { completed },
        select: savedLogSelect,
      });
      return { ...row, date: row.date.toISOString().slice(0, 10) };
    },

    async listScheduledForDay(ownerId, day, logDate) {
      const rows = await database.habit.findMany({
        where: { userId: ownerId, frequency: { has: day } },
        orderBy: newestFirst,
        select: {
          ...habitSelect,
          logs: { where: { date: new Date(`${logDate}T00:00:00.000Z`) }, select: logSelect },
        },
      });
      return rows.map((row) => {
        const log = row.logs[0];
        return {
          ...toHabit(row),
          log: log ? { ...log, date: log.date.toISOString().slice(0, 10) } : null,
        };
      });
    },
  };
}
