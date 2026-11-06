import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

/** Applies the committed migrations to `url`. The URL is passed explicitly: `.env` is never relied upon. */
export function migrate(url: string) {
  const prismaCli = createRequire(join(process.cwd(), "package.json")).resolve("prisma/build/index.js");
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    cwd: process.cwd(),
    env: { ...process.env, DIRECT_URL: url, DATABASE_URL: url },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`prisma migrate deploy failed:\n${result.stdout}\n${result.stderr}`);
  }
}
