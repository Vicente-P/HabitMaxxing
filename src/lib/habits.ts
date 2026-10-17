type UserDatabase = {
  user: { findUnique(args: { where: { id: string }; select: { id: true } }): Promise<{ id: string } | null> };
};

export async function requireHabitOwner(session: unknown, database: UserDatabase): Promise<string | null> {
  if (!session || typeof session !== "object" || !("user" in session)) return null;
  const user = session.user;
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  const id = user.id;
  if (typeof id !== "string" || !id.trim()) return null;
  const account = await database.user.findUnique({ where: { id }, select: { id: true } });
  return account ? id : null;
}
