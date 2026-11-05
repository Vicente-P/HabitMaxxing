# Repository contract and PostgreSQL integration tests (ADR-06, T1-T4)

Implement T1-T4 of ADR-06 (`docs/architecture/decisions/ADR-06-tests-de-integracion-con-postgres.md`, Accepted 2026-11-05): a shared HabitRepository contract suite run against the in-memory repository and the Prisma adapter on real PostgreSQL. T5 (CI job) is deferred (GitHub billing lock); T6 (docs, ADR status) closes the work.

## Specs

- S1: Shared contract suite `describeHabitRepositoryContract(name, factory)` in `habit-repository.contract.ts`, run against `InMemoryHabitRepository` (T1). Cases: create (owner, null unit for binary); listByOwner (owner scoping, `createdAt desc, id asc`, tie-break); listScheduledForDay (weekday filter, Sunday = 0, only the log of `logDate`, same ordering); findById (foreign habit returned, missing is null); upsertBinaryLog (create, revert updates same row, never deletes, one row per habit and day); upsertNumericLog (create with `completed: true`, second value same day replaces); date returns `YYYY-MM-DD` without shift.
- S2: Vitest project `integration` (`*.integration.test.ts`, node environment, sequential), script `test:integration`, `globalSetup` that starts PostgreSQL with Testcontainers (or uses `TEST_DATABASE_URL`) and runs `prisma migrate deploy` (T2). `pnpm exec vitest run` keeps working unchanged and does not require Docker.
- S3: Safeguard: the suite reads ONLY `TEST_DATABASE_URL`, never `DATABASE_URL`/`DIRECT_URL`/`.env`; it aborts when the host is not `localhost`/`127.0.0.1` or the database name does not contain `test`. A test covers the abort (T2).
- S4: `prisma-habit-repository.integration.test.ts` runs the contract suite against Prisma on PostgreSQL; tables are truncated (`TRUNCATE ... RESTART IDENTITY CASCADE`) before each test (T3).
- S5: Database-only cases: unique `(habitId, date)`, cascade `User -> Habit -> HabitLog`, `@db.Date` round trip without time zone shift, `frequency has` on `Int[]` (T4).
- S6: Proof of value: break the adapter on purpose (remove the owner filter in `listByOwner`, or change `habitId_date`), observe the integration suite fail while mocked tests still pass, then revert.

## Tasks

- [ ] T1 (S1) - contract suite against in-memory - worker - commit: pending
- [ ] T2 (S2, S3) - integration project, global setup, safeguard - worker - commit: pending
- [ ] T3 (S4) - contract against Prisma/PostgreSQL - worker - commit: pending
- [ ] T4 (S5, S6) - database-only cases and proof of value - worker - commit: pending
- [ ] T6 - docs (testing guide, setup, ADR-06 note) - parent - commit: pending

## Log

- L1 (user, verbatim): "Si estoy de acuerdo" (approving: Testcontainers locally and a PostgreSQL service in CI; informative CI job first; T1-T4 before T5) after "Dejemos eso documentado y arma el plan para mejoras 1 y 2".
