import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { join } from "node:path";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { assertSafeTestDatabase } from "../src/test/assert-safe-test-database";
import { POSTGRES_IMAGE, TEST_DATABASE_NAME } from "../src/test/integration/constants";
import { migrate } from "../src/test/integration/migrate";
import { E2E_ORIGIN, E2E_PORT } from "./env";

const nextCli = createRequire(join(process.cwd(), "package.json")).resolve("next/dist/bin/next");

/**
 * Everything the app reads is passed explicitly, so `.env` (which Next loads only for variables that are
 * missing from the process environment) can never supply a database URL or a secret.
 */
function appEnv(databaseUrl: string): NodeJS.ProcessEnv {
  // `next build` / `next start` set NODE_ENV themselves; TEST_DATABASE_URL belongs to the integration suite.
  const { NODE_ENV: _nodeEnv, TEST_DATABASE_URL: _testUrl, ...inherited } = process.env;
  void _nodeEnv;
  void _testUrl;
  return {
    ...inherited,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: databaseUrl,
    AUTH_SECRET: randomBytes(32).toString("hex"),
    AUTH_URL: E2E_ORIGIN,
    APP_ORIGIN: E2E_ORIGIN,
  } as unknown as NodeJS.ProcessEnv;
}

async function waitForServer(server: ChildProcess, output: () => string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start exited early (${server.exitCode}):\n${output()}`);
    try {
      const response = await fetch(`${E2E_ORIGIN}/login`);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`next start did not become ready in 60s:\n${output()}`);
}

async function countUsers(url: string): Promise<number> {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: assertSafeTestDatabase(url) }) });
  try {
    return await prisma.user.count();
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Order is guaranteed by construction: container -> safeguard -> migrations -> build -> server -> tests.
 * (`webServer` would start before this hook, so the server is launched here instead.)
 */
export default async function globalSetup() {
  const started = Date.now();
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withDatabase(TEST_DATABASE_NAME)
    .start();
  let server: ChildProcess | undefined;
  const url = container.getConnectionUri();

  try {
    assertSafeTestDatabase(url);
    migrate(url);
    const target = new URL(url);
    console.log(`[e2e] PostgreSQL container ready in ${((Date.now() - started) / 1000).toFixed(1)}s (${target.host}${target.pathname})`);

    const env = appEnv(url);
    const buildStarted = Date.now();
    const build = spawnSync(process.execPath, [nextCli, "build"], { env, encoding: "utf8", cwd: process.cwd() });
    if (build.status !== 0) throw new Error(`next build failed:\n${build.stdout}\n${build.stderr}`);
    console.log(`[e2e] next build done in ${((Date.now() - buildStarted) / 1000).toFixed(1)}s`);

    let logs = "";
    server = spawn(process.execPath, [nextCli, "start", "-p", String(E2E_PORT)], { env, cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
    server.stdout?.on("data", (chunk) => { logs += chunk; });
    server.stderr?.on("data", (chunk) => { logs += chunk; });
    await waitForServer(server, () => logs);
    console.log(`[e2e] app listening on ${E2E_ORIGIN}`);
  } catch (error) {
    server?.kill();
    await container.stop();
    throw error;
  }

  const running = server;
  return async () => {
    try {
      // Evidence of isolation: the users registered through the UI live in this throwaway container.
      console.log(`[e2e] users registered in the container database: ${await countUsers(url)}`);
    } finally {
      running?.kill();
      await container.stop();
    }
  };
}
