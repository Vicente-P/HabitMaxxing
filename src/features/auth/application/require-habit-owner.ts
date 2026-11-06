import type { UserLookup } from "./user-lookup";

/** Returns the id of the authenticated, existing account in `session`, or null when the session is missing, malformed or stale. */
export async function requireHabitOwner(session: unknown, users: UserLookup): Promise<string | null> {
  if (!session || typeof session !== "object" || !("user" in session)) return null;
  const user = session.user;
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const id = user.id;
  if (typeof id !== "string" || !id.trim()) return null;
  return (await users.exists(id)) ? id : null;
}
