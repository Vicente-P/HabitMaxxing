# HU-09 Daily Agenda

## Objective and problem

Implement SCRUM-14's daily habit agenda on top of the HU-06 catalog. Users need to see habits scheduled for a selected date and their completion state without changing the existing all-habits catalog contract.

## Why

HU-06 intentionally delivers a persistent catalog, not daily scheduling or completion semantics. HU-09 is the next backlog story and the existing `HabitLog` model/API contract can supply per-date status; mutation flows remain in HU-10.

## Scope and constraints

- Authorized local implementation on `codex/hu-09-daily-agenda`, based on `codex/hu-06-v2-dashboard` at `60d5545`.
- Add a daily agenda view and its authenticated, owner-scoped read behavior while preserving `GET /api/habits?view=catalog` unchanged.
- Query semantics: when `date` is present, its weekday is authoritative for schedule filtering even if a supplied `day` conflicts. Without `date`, `day` selects the schedule weekday; otherwise use the server's current date. `date` continues to identify the requested log date.
- Empty states are distinct: no owned habits prompts creation; existing habits with none scheduled for the selected date explains that no habits are scheduled for that day.
- Show existing completion state only; do not add completion/log mutation controls, edit/delete flows, user timezone support, publication, deployment, or remote operations.
- Preserve existing untracked user paths `.agents/skills/bmad-agent-pm/` and `.agents/skills/bmad-prd/`.
- Engram mirror: PENDING because no authoritative runtime session identity was provided; do not invent one.

## Delivery plan and route

- Forecast: approximately 450 authored changed lines across behavior, tests, and tracking; generated files excluded. Delivery strategy: `ask-on-risk` if the forecast/running count crosses the ~400-line slice boundary; no PR or remote publication is authorized.
- HU09-01 — API contract and focused route/library tests. Route: delegated direct; API filtering and response-shape research spans multiple files. Test-first: capture/extend deterministic route tests before implementation.
- HU09-02 — agenda UI, selected-date behavior, completion presentation, and distinct empty states with UI tests. Route: delegated direct; multiple non-trivial UI/test files. Test-first: add behavior assertions before implementation.
- HU09-03 — run applicable regression/typecheck/build checks and reconcile this document. Route: delegated verification for command execution, then parent spot-check.

## Acceptance criteria

1. An authenticated user sees only their habits scheduled for the selected date, together with completion state for that date when a log exists.
2. A supplied `date` determines the schedule weekday even when `day` conflicts; `day` alone remains supported, and the existing catalog view remains backward-compatible.
3. Unauthenticated requests remain unauthorized, responses remain private/no-store, and one user's agenda never exposes another user's habits or logs.
4. The dashboard distinguishes a user with no habits from a user whose existing habits are simply not scheduled for the selected day.
5. Completion is read-only in HU-09; no new log writes or completion toggles are introduced.

## Checks

- Focused route/library tests covering date/day precedence, date filtering, logs, ownership, authorization, invalid query values, and catalog compatibility.
- Focused dashboard tests for scheduled/pending/completed presentation and both empty states.
- Repository-defined typecheck and full deterministic regression suite; production build if existing scripts and the environment permit it. Record skipped/unavailable checks honestly.

## Progress and evidence

- [x] HU09-00 — Confirm local HU-06 base, define HU-09 scope, and resolve date/day precedence and empty-state behavior. Evidence: user selected `date` as the source of truth and approved a distinct no-scheduled-habits message.
- [x] HU09-01 — Implement the daily read contract and tests. Evidence: `GET /api/habits` validates `date`/`day`, gives `date` weekday precedence, filters by owner and scheduled weekday, and returns only that date's `todayLog` plus `{ day, date, total }`; catalog query behavior is preserved. Test-first RED: focused suite failed on the newly-added daily cases because the route rejected daily queries (3 failed, 68 passed). GREEN: `pnpm test --run tests/habits-route.test.ts` passed (69 tests); `pnpm typecheck` passed after lint normalization. No write or UI behavior was added.
- [ ] HU09-02 — Implement the daily agenda UI and tests.
- [ ] HU09-03 — Verify the completed local candidate and record commit/check evidence.

## Next step

Proceed with HU09-02: implement the daily agenda UI and focused UI tests, preserving the API contract and distinct empty states. HU09-01 is committed locally; no remote operation is authorized.
