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

export function createPrismaHabitRepository(database: Pick<PrismaClient, "habit">): HabitRepository {
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
