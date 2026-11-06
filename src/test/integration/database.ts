import { PrismaPg } from "@prisma/adapter-pg";
import { inject } from "vitest";
import { PrismaClient } from "@/generated/prisma";
import { assertSafeTestDatabase } from "../assert-safe-test-database";

/** Builds a client for the integration database, re-checking the safeguard in the worker. Never reads DATABASE_URL. */
export function createTestPrismaClient(): PrismaClient {
  const connectionString = assertSafeTestDatabase(inject("testDatabaseUrl"));
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Empties every table. Destructive: only call on a client from `createTestPrismaClient`. */
export async function truncateAll(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe('TRUNCATE "HabitLog","Habit","User" RESTART IDENTITY CASCADE');
}
