import { Prisma, type PrismaClient } from "@/generated/prisma";
import { loginSchema } from "@/lib/validations";

export type LoginDependencies = {
  database: Pick<PrismaClient, "$transaction">;
  compare: (password: string, hash: string) => Promise<boolean>;
  now?: () => Date;
};

const FAILURE_LIMIT = 5;
const LOCK_DURATION_MS = 15 * 60_000;
const MAX_ATTEMPTS = 3;
// A fixed cost-12 hash unrelated to any account, used only for missing-user work.
const DUMMY_HASH = "$2b$12$QhOo43k6aQvaUjxYFTyTAevNHpKBfE8XivKrZmZ15bpGafNsrlLKq";

export async function verifyLogin(credentials: unknown, { database, compare, now = () => new Date() }: LoginDependencies) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // Return rejected decisions, rather than throwing and rolling back counters.
      return await database.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, password: true, failedLoginAttempts: true, lockedUntil: true },
        });
        if (!user) {
          await compare(parsed.data.password, DUMMY_HASH);
          return null;
        }

        // Sample after the awaited read, including on serialization retries.
        const currentTime = now();
        const locked = user.lockedUntil !== null && user.lockedUntil > currentTime;
        const matches = await compare(parsed.data.password, user.password);
        if (locked) return null;

        const failures = user.lockedUntil !== null ? 0 : user.failedLoginAttempts;
        if (!matches) {
          const nextFailures = failures + 1;
          await tx.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: nextFailures,
              lockedUntil: nextFailures >= FAILURE_LIMIT ? new Date(now().getTime() + LOCK_DURATION_MS) : null,
            },
          });
          return null;
        }

        await tx.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        return { id: user.id, email: user.email, name: user.name };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 5000 });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") return null;
    }
  }
  return null;
}
