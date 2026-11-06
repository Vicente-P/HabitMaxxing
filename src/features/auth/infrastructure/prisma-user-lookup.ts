import type { PrismaClient } from "@/generated/prisma";
import type { UserLookup } from "../application/user-lookup";

export function createPrismaUserLookup(database: Pick<PrismaClient, "user">): UserLookup {
  return {
    async exists(userId) {
      const account = await database.user.findUnique({ where: { id: userId }, select: { id: true } });
      return account !== null;
    },
  };
}
