import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma";
import { createTestPrismaClient, truncateAll } from "@/test/integration/database";
import { describeHabitRepositoryContract } from "../application/habit-repository.contract";
import { createPrismaHabitRepository } from "./prisma-habit-repository";

let prisma: PrismaClient;
let users = 0;

beforeAll(() => { prisma = createTestPrismaClient(); });
afterAll(async () => { await prisma.$disconnect(); });
beforeEach(async () => { await truncateAll(prisma); });

async function createUser() {
  users += 1;
  const user = await prisma.user.create({ data: { email: `user-${users}@example.test`, password: "hash" } });
  return user.id;
}

describeHabitRepositoryContract("PrismaHabitRepository", () => ({
  repository: createPrismaHabitRepository(prisma),
  createOwner: createUser,
  async seedHabit(input) {
    return prisma.habit.create({
      data: {
        id: input.id, name: input.name ?? "Habit", type: input.type ?? "BINARY", unit: input.unit ?? null,
        frequency: input.frequency, userId: input.ownerId, createdAt: input.createdAt,
      },
    });
  },
}));

describe("PostgreSQL behaviour behind the adapter", () => {
  async function habitWithLog() {
    const userId = await createUser();
    const habit = await prisma.habit.create({ data: { name: "Read", type: "BINARY", frequency: [1], userId } });
    const log = await prisma.habitLog.create({ data: { habitId: habit.id, date: new Date("2026-05-20T00:00:00.000Z") } });
    return { userId, habit, log };
  }

  it("rejects a second log for the same habit and date", async () => {
    const { habit } = await habitWithLog();
    await expect(
      prisma.habitLog.create({ data: { habitId: habit.id, date: new Date("2026-05-20T00:00:00.000Z") } }),
    ).rejects.toMatchObject({ code: "P2002" });
    expect(await prisma.habitLog.count()).toBe(1);
  });

  it("cascades User -> Habit -> HabitLog on user delete", async () => {
    const { userId } = await habitWithLog();
    await prisma.user.delete({ where: { id: userId } });
    expect(await prisma.habit.count()).toBe(0);
    expect(await prisma.habitLog.count()).toBe(0);
  });

  it("cascades Habit -> HabitLog on habit delete and keeps the user", async () => {
    const { habit } = await habitWithLog();
    await prisma.habit.delete({ where: { id: habit.id } });
    expect(await prisma.habitLog.count()).toBe(0);
    expect(await prisma.user.count()).toBe(1);
  });

  it("deletes only the owner's habit row and cascades its logs through the adapter", async () => {
    const owner = await createUser();
    const other = await createUser();
    const repository = createPrismaHabitRepository(prisma);
    const mine = await repository.create({ name: "Read", type: "BINARY", unit: null, frequency: [3], ownerId: owner });
    const theirs = await repository.create({ name: "Run", type: "BINARY", unit: null, frequency: [3], ownerId: other });
    await repository.upsertBinaryLog(mine.id, "2026-05-20", true);
    await repository.upsertBinaryLog(theirs.id, "2026-05-20", true);
    expect(await repository.delete(theirs.id, owner)).toBe(false);
    expect(await prisma.habitLog.count()).toBe(2);
    expect(await repository.delete(mine.id, owner)).toBe(true);
    expect(await prisma.habitLog.count({ where: { habitId: mine.id } })).toBe(0);
    expect(await prisma.habitLog.count({ where: { habitId: theirs.id } })).toBe(1);
    expect(await prisma.habit.count()).toBe(1);
    expect(await prisma.user.count()).toBe(2);
  });

  it.each(["2026-12-31", "2027-01-01", "2026-03-01", "2028-02-29"])(
    "round-trips @db.Date %s without time zone shift",
    async (date) => {
      const userId = await createUser();
      const repository = createPrismaHabitRepository(prisma);
      const habit = await repository.create({ name: "Read", type: "BINARY", unit: null, frequency: [0], ownerId: userId });
      const saved = await repository.upsertBinaryLog(habit.id, date, true);
      expect(saved.date).toBe(date);
      const [row] = await prisma.$queryRaw<{ day: string }[]>`SELECT to_char("date", 'YYYY-MM-DD') AS day FROM "HabitLog" WHERE id = ${saved.id}`;
      expect(row.day).toBe(date);
    },
  );

  it("filters Int[] frequency with has, including Sunday = 0", async () => {
    const userId = await createUser();
    await prisma.habit.create({ data: { id: "sun", name: "A", type: "BINARY", frequency: [0, 6], userId } });
    await prisma.habit.create({ data: { id: "mon", name: "B", type: "BINARY", frequency: [1], userId } });
    const sunday = await prisma.habit.findMany({ where: { userId, frequency: { has: 0 } }, select: { id: true } });
    expect(sunday.map((h) => h.id)).toEqual(["sun"]);
    const saturday = await prisma.habit.findMany({ where: { userId, frequency: { has: 6 } }, select: { id: true } });
    expect(saturday.map((h) => h.id)).toEqual(["sun"]);
    expect(await prisma.habit.findMany({ where: { userId, frequency: { has: 2 } } })).toEqual([]);
  });
});
