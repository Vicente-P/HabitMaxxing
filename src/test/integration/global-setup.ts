import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";
import { assertSafeTestDatabase, readTestDatabaseUrl } from "../assert-safe-test-database";
import { POSTGRES_IMAGE, TEST_DATABASE_NAME } from "./constants";
import { migrate } from "./migrate";

declare module "vitest" {
  export interface ProvidedContext {
    testDatabaseUrl: string;
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
