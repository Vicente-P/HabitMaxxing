import { describe, expect, it } from "vitest";
import { assertSafeTestDatabase, readTestDatabaseUrl } from "./assert-safe-test-database";

describe("assertSafeTestDatabase", () => {
  it("accepts a local database whose name contains test", () => {
    const url = "postgresql://postgres:postgres@localhost:5432/habitmaxxing_test";
    expect(assertSafeTestDatabase(url)).toBe(url);
    expect(assertSafeTestDatabase("postgresql://u:p@127.0.0.1:55432/test")).toBe("postgresql://u:p@127.0.0.1:55432/test");
  });

  it("aborts for a Supabase-like URL", () => {
    expect(() =>
      assertSafeTestDatabase("postgresql://postgres.abc:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"),
    ).toThrow(/refusing/i);
  });

  it("aborts for a non-local host even when the name contains test", () => {
    expect(() => assertSafeTestDatabase("postgresql://u:p@db.example.com:5432/app_test")).toThrow(/host/i);
  });

  it("aborts for a local database without test in its name", () => {
    expect(() => assertSafeTestDatabase("postgresql://u:p@localhost:5432/habitmaxxing")).toThrow(/test/i);
  });

  it("aborts for a missing or malformed URL", () => {
    expect(() => assertSafeTestDatabase(undefined)).toThrow();
    expect(() => assertSafeTestDatabase("not a url")).toThrow();
  });

  it("does not leak credentials in the error message", () => {
    expect(() => assertSafeTestDatabase("postgresql://u:topsecret@db.example.com:5432/x")).toThrow(/^(?!.*topsecret)/);
  });
});

describe("readTestDatabaseUrl", () => {
  it("reads only TEST_DATABASE_URL and ignores DATABASE_URL and DIRECT_URL", () => {
    const env = {
      TEST_DATABASE_URL: "postgresql://u:p@localhost:5432/x_test",
      DATABASE_URL: "postgresql://u:p@prod.supabase.com:5432/postgres",
      DIRECT_URL: "postgresql://u:p@prod.supabase.com:5432/postgres",
    };
    expect(readTestDatabaseUrl(env)).toBe("postgresql://u:p@localhost:5432/x_test");
    expect(readTestDatabaseUrl({ DATABASE_URL: env.DATABASE_URL, DIRECT_URL: env.DIRECT_URL })).toBeUndefined();
  });

  it("treats an empty value as unset", () => {
    expect(readTestDatabaseUrl({ TEST_DATABASE_URL: "" })).toBeUndefined();
  });
});
