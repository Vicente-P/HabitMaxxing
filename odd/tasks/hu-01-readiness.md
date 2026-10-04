# HU-01 Readiness

## Objective

Align the requirements, UX contract, architecture, and verification baseline for HU-01 account registration before implementation begins.

## Problem

HU-01 has usable API-oriented requirements, but the welcome-email scope, post-registration failure behavior, UI states, authentication boundaries, infrastructure guidance, and test baseline are not fully consistent.

## Why

Implementation should start from one coherent contract instead of forcing developers to resolve product and architecture decisions while coding.

## Authorized scope

- Create and activate the BMad initiative for the HabitMaxxing MVP.
- Consolidate the accepted HU-01 decisions into a BMad spec.
- Align existing requirements, UX, architecture, infrastructure, and verification documentation.
- Do not implement application behavior.

## Constraints

- Preserve the existing backlog and specifications as source material.
- Keep the pre-existing `.atl/skill-registry.md` and `.atl/.skill-registry.cache.json` changes untouched.
- Use the existing Prisma model unless the readiness review proves a schema change is required.
- Artifacts follow the repository's existing professional Spanish documentation style.

## Accepted decisions

- Welcome email delivery is removed from HU-01 and deferred to a later story.
- If account creation succeeds but automatic sign-in fails, the account remains valid and the UI explains the situation with a link to login.
- HU-01 supports the light theme only; dark-mode activation is deferred.
- Duplicate-email conflicts remain observable internally, but the UI displays a neutral message that does not confirm account existence.
- Registration uses `POST /api/auth/register`; Auth.js Credentials owns login/session; `proxy.ts` protects authenticated routes.

## Tasks

- [x] **HUR-001 — Create and activate the BMad MVP initiative**
  - Route: inline; mechanical initiative metadata and personal config update.
  - Acceptance: `core.active_initiative` resolves to `initiative-habitmaxxing-mvp` and the initiative file exists.
  - Evidence: `_bmad/scripts/resolve_config.py` returned `initiative-habitmaxxing-mvp`; initiative metadata read back successfully.
  - Work unit: `7cec2ba` (`docs: start HU-01 readiness initiative`).
  - Review: RDD reported `off`; delivery remains unmanaged. Repository identity resolution also returned `Acceso denegado`.
- [x] **HUR-002 — Produce the HU-01 BMad specification**
  - Route: delegated; requires multi-source requirements, UX, and architecture synthesis.
  - Acceptance: the spec kernel and companions preserve all load-bearing decisions and expose unresolved questions explicitly.
  - Evidence: coherence and preservation validation passed; three capabilities and one spec-authored contract companion were produced.
  - Work unit: `b5458c6` (`docs: specify HU-01 registration`).
  - Review: RDD remains disabled/unmanaged.
- [x] **HUR-003 — Align requirements and UX source documents**
  - Route: delegated; touches multiple non-trivial documentation files.
  - Acceptance: HU-01 criteria, failure states, accessibility, responsive behavior, and deferred scope are consistent.
  - Evidence: Removed welcome email from HU-01 criteria/tasks and deferred it without tracker key; standardized privacy-preserving duplicate copy; documented UI, accessible form, responsive contract, light-only scope, normalization, and input limits across sources and BMad derived artifacts. Rate-limit mechanism remains explicitly assigned to HUR-004.
  - Verification: BMad config resolved `core.active_initiative=initiative-habitmaxxing-mvp`; scoped `git diff --check` passed; cross-document traceability checked; `git diff --name-only -- src app prisma` returned no application source changes.
  - Work unit: `8b81450` (`docs: align HU-01 requirements and UX`).
  - Review: RDD remains disabled/unmanaged.
- [x] **HUR-004 — Align architecture and verification guidance**
  - Route: delegated; requires current primary-source verification for unstable framework and Supabase details.
  - Acceptance: authentication boundaries, route protection, database connection guidance, migrations, and noninteractive test commands are coherent.
  - Evidence: aligned architecture/deployment/testing guidance; added `DIRECT_URL` to local example, Prisma CLI config, and CI secret reference; removed registration rate limiting from HU-01 and BMad derivations, deferring abuse protection to future infrastructure without tracker key/provider choice. BMad spec self-validation coherence/preservation recorded in `.memlog.md`.
  - Verification: direct `prisma.cmd validate` and `prisma.cmd generate` passed using a local placeholder `DIRECT_URL`; `pnpm typecheck` and `pnpm lint` passed; direct `vitest.cmd run` exited 0 and reported no test files. `pnpm exec vitest run` failed in the local pnpm shim (`vitest` not recognized), so the equivalent local executable was run directly. No deployed migration status was queried; it remains unverified without real `DIRECT_URL` access. `git diff --check` passed; `git diff --name-only -- src app` returned no paths. No behavior files changed. No files staged or committed per instruction.
  - Work unit: not committed; explicitly prohibited for this task.
- [ ] **HUR-005 — Validate readiness for implementation**
  - Route: delegated verification.
  - Acceptance: requirements, UX, architecture, and checks produce no unresolved implementation blocker.

## Checks

- BMad configuration resolves the active initiative.
- BMad spec self-validation passes coherence and preservation checks.
- Prisma schema validates and client generates with a syntactically valid local `DIRECT_URL` placeholder; this does not verify a deployed database or its migration status.
- `pnpm typecheck` and `pnpm lint` pass. Direct Vitest executable exits 0 with no test files found; the exact `pnpm exec vitest run` invocation fails in the local shim. Successful execution does not establish coverage.
- Documentation links and referenced paths exist.
- `git diff --check` passes for authored files.
- No application feature code is changed.

## Delivery

- Strategy: `ask-on-risk`.
- Forecast: approximately 250–400 authored documentation lines, excluding generated BMad support files.
- Engram mirror: pending because the runtime session identity is unavailable after compaction.

## Progress

- Current task: HUR-005.
- Verified outcome: HUR-001, HUR-002, and HUR-003 complete. HUR-003 coherence and preservation validation passed; source and derived contract decisions were cross-checked. Existing HUR-002 work-unit evidence is preserved. HUR-004 documentation and config alignment is complete; Prisma validation/generation, typecheck, lint, and direct Vitest executable passed. The Vitest run found no test files, so it is not evidence of coverage; `pnpm exec vitest run` itself failed under the local pnpm shim although the direct executable succeeded. No deployed migration status was queried.
- Next step: HUR-005 — validate readiness for implementation, including the empty test discovery and unverified deployed migration status. The rate-limit requirement is explicitly out of HU-01 and deferred to infrastructure without a tracker key.
