/** PostgreSQL image used for integration tests (single source of truth). */
export const POSTGRES_IMAGE = "postgres:17-alpine";

/** Name of the throwaway database; must contain "test" to satisfy the safeguard. */
export const TEST_DATABASE_NAME = "habitmaxxing_test";
