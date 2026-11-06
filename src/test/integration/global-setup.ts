import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";
import { assertSafeTestDatabase, readTestDatabaseUrl } from "../assert-safe-test-database";
import { POSTGRES_IMAGE, TEST_DATABASE_NAME } from "./constants";

declare module "vitest" {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}

/** Applies the committed migrations to `url`. The URL is passed explicitly: `.env` is never relied upon. */
function migrate(url: string) {
  const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    cwd: process.cwd(),
    env: { ...process.env, DIRECT_URL: url, DATABASE_URL: url },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`prisma migrate deploy failed:\n${result.stdout}\n${result.stderr}`);
  }
}

export default async function setup(project: TestProject) {
  let container: StartedPostgreSqlContainer | undefined;
  let url = readTestDatabaseUrl();

  if (!url) {
    const started = Date.now();
    container = await new PostgreSqlContainer(POSTGRES_IMAGE).withDatabase(TEST_DATABASE_NAME).start();
    url = container.getConnectionUri();
    console.log(`[integration] PostgreSQL container ready in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  }

  try {
    assertSafeTestDatabase(url);
    migrate(url);
  } catch (error) {
    await container?.stop();
    throw error;
  }

  project.provide("testDatabaseUrl", url);

  return async () => {
    await container?.stop();
  };
}
