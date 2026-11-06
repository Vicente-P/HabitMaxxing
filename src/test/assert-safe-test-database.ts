const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * Reads the integration database URL. Only `TEST_DATABASE_URL` is consulted:
 * `DATABASE_URL` and `DIRECT_URL` are never read, so a developer `.env` cannot be reached.
 */
export function readTestDatabaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  const value = env.TEST_DATABASE_URL;
  return value ? value : undefined;
}

/**
 * Throws unless the URL targets a local host AND a database whose name contains "test".
 * The integration suite runs destructive TRUNCATEs, so this is the last line of defence
 * against pointing it at a shared or production database. Error messages never echo credentials.
 */
export function assertSafeTestDatabase(url: string | undefined): string {
  if (!url) {
    throw new Error("Refusing to run integration tests: no test database URL was provided.");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Refusing to run integration tests: the test database URL is not a valid URL.");
  }
  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(`Refusing to run integration tests: host "${parsed.hostname}" is not localhost or 127.0.0.1.`);
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!database.toLowerCase().includes("test")) {
    throw new Error(`Refusing to run integration tests: database name "${database}" must contain "test".`);
  }
  return url;
}
