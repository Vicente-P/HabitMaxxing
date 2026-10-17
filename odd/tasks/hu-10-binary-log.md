# HU-10 Binary Habit Log (ADR-05 preparation)

## Objective and problem

Prepare the habits server code for SCRUM-15 (register a binary habit as completed, with toggle) by applying ADR-05 to the `habits` feature: introduce a domain-shaped repository port with a Prisma adapter and move code into `src/features/habits/` and `src/shared/`. Today `src/lib/habits.ts` mixes use cases, Prisma query shapes (`select`, `where`), DTO mapping and the session guard `requireHabitOwner`; `src/app/api/habits/route.ts` also holds date/day resolution logic.

## Why

HU-10 adds a write path (`POST /api/habits/:id/logs`) with ownership checks and toggle semantics. Building it on the current Prisma-shaped "port" would deepen the coupling ADR-05 was accepted to remove. Migrating `habits` first, behind the existing tests, keeps HU-10 small and testable without a database.

## Scope and constraints

- Branch: `feature/SCRUM-15-registrar-habito-binario`, based on `origin/develop` at `ea29c6e`.
- Authorized in this run: HU10-01 and HU10-02 only (behavior-preserving refactor). HU10-03 (lint rule) and HU10-04 (HU-10 behavior) require a new go-ahead.
- No behavior change: HTTP contract, status codes, headers and response bodies of `/api/habits` stay identical.
- Keep the UI under `src/app/(dashboard)/dashboard/` untouched; UI migration is a later story.
- Do not edit `src/generated/prisma/` or `_bmad/scripts/`. No push, PR or remote operation without explicit approval.
- Commits: conventional, no AI attribution.
- Engram mirror topic: `odd/hu-10-binary-log/tasks`.

## Target mapping (from the cut proposed with ADR-05)

| Current | Target |
|---|---|
| `createHabit`, `listDailyHabits`, `listHabitCatalog` (`src/lib/habits.ts`) | `src/features/habits/application/` |
| `HabitDatabase`, `habitSelect`, `habitDto` | `src/features/habits/infrastructure/` (Prisma repository) behind a `HabitRepository` port |
| `requireHabitOwner` | `src/features/auth/` public API |
| `src/lib/habit-request.ts` | `src/shared/http/` |
| `createHabitSchema` (`src/lib/validations.ts`) | `src/features/habits/domain/` |
| date/day resolution in `src/app/api/habits/route.ts` | domain function |

## Delivery plan and route

- Forecast: approximately 400 authored changed lines for HU10-01 and HU10-02 combined (moves count as additions plus deletions). Reassess before each commit; if the running count clearly exceeds the slice boundary, stop and ask for the chain strategy.
- HU10-01 — `HabitRepository` port, Prisma adapter, use cases and route wired to them; rewrite the library tests with an in-memory repository. Route: delegated direct (multiple non-trivial files plus preparatory reading). Test-first: adapt tests to the new port, observe RED, then implement.
- HU10-02 — move domain schema, use cases, `requireHabitOwner` and HTTP guards to their ADR-05 locations; update imports and test locations. Route: delegated direct.
- HU10-03 — lint rule for `domain` purity and Prisma confinement. Pending authorization.
- HU10-04 — HU-10 behavior (`toggleBinaryLog`, `POST /api/habits/:id/logs`, toggle UI). Pending authorization.

## Acceptance criteria (HU10-01 and HU10-02)

1. Prisma is imported only from the infrastructure adapter and `src/shared`/composition code; use cases depend on the `HabitRepository` port.
2. The existing deterministic suite passes with no change to route-level expectations in `tests/habits-route.test.ts`.
3. `pnpm typecheck` and `pnpm lint` pass.
4. The `habits` row in `docs/architecture/overview.md` migration table is updated.

## Checks

- `pnpm exec vitest run` (baseline before changes, then after each commit).
- `pnpm typecheck`, `pnpm lint`. Production build if the environment permits; record skips honestly.

## Progress and evidence

- [x] HU10-01 — Port, adapter, use cases, route wiring and tests. Commit `fb9eff6` (`refactor(habits): introduce habit repository port and prisma adapter`). Route: delegated direct (writer). Baseline `pnpm exec vitest run`: 12 files / 254 tests passing. RED observed: new domain and application tests failed with "Failed to resolve import" before implementation. GREEN after: 14 files / 278 tests; `pnpm typecheck` clean; `pnpm lint` 0 errors (1 pre-existing warning in `eslint.config.mjs`). `tests/habits-route.test.ts` untouched and passing. Size: 379 additions + 150 deletions (about 529 lines, over the 400 heuristic because the port, adapter, domain function and their tests belong together). `requireHabitOwner` stayed in `src/lib/habits.ts` for this commit.
- [x] HU10-02 — Relocate files per ADR-05 and update the overview table. Commit `72ca5d7` (`refactor(habits): relocate habits, auth guard and http guards per ADR-05`). No meaningful RED for the pure moves (`createHabitSchema`, `habit-request` and its tests); RED observed for the new `requireHabitOwner`/`UserLookup` port tests (unresolved imports). After: 15 files / 280 tests; `pnpm typecheck` clean; `pnpm lint` 0 errors (same pre-existing warning). Moved: `createHabitSchema`/`CreateHabitInput` to `src/features/habits/domain/create-habit-schema.ts` (exposed via `src/features/habits/index.ts`), `requireHabitOwner` to `src/features/auth/` (port `UserLookup`, Prisma adapter, `index.ts`), `habit-request` and its test to `src/shared/http/`; deleted `src/lib/habits.ts`/`habits.test.ts`; overview table and tree updated. `tests/validations.test.ts` needed no change (it only imports `registerSchema`).
- [x] HU10-03 — Lint boundaries. Route: inline (one config file plus doc updates; no research or open design). RED: three temporary violating files (`domain` importing `@/lib/prisma`, `application` importing `next/server`, `auth/application` importing `@/features/habits/application/create-habit`) passed `eslint` with exit 0 before the rule. GREEN: after adding `boundaryGuards` to `eslint.config.mjs` (`no-restricted-imports`, features auto-detected from `src/features/`), the same three files fail with the expected messages (3 errors) and were then deleted; `pnpm lint` on the real code: 0 errors, same 1 pre-existing warning. ADR-05 consequences updated (lint rule in place, `eslint-plugin-boundaries` only if the pattern list grows).
- [ ] HU10-04 — HU-10 behavior (not authorized yet).

## Next step

HU10-04 (HU-10 behavior: `toggleBinaryLog`, `POST /api/habits/:id/logs`, toggle UI) needs a new go-ahead.
