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
- [ ] **HUR-002 — Produce the HU-01 BMad specification**
  - Route: delegated; requires multi-source requirements, UX, and architecture synthesis.
  - Acceptance: the spec kernel and companions preserve all load-bearing decisions and expose unresolved questions explicitly.
- [ ] **HUR-003 — Align requirements and UX source documents**
  - Route: delegated; touches multiple non-trivial documentation files.
  - Acceptance: HU-01 criteria, failure states, accessibility, responsive behavior, and deferred scope are consistent.
- [ ] **HUR-004 — Align architecture and verification guidance**
  - Route: delegated; requires current primary-source verification for unstable framework and Supabase details.
  - Acceptance: authentication boundaries, route protection, database connection guidance, migrations, and noninteractive test commands are coherent.
- [ ] **HUR-005 — Validate readiness for implementation**
  - Route: delegated verification.
  - Acceptance: requirements, UX, architecture, and checks produce no unresolved implementation blocker.

## Checks

- BMad configuration resolves the active initiative.
- BMad spec self-validation passes coherence and preservation checks.
- Documentation links and referenced paths exist.
- `git diff --check` passes for authored files.
- No application feature code is changed.

## Delivery

- Strategy: `ask-on-risk`.
- Forecast: approximately 250–400 authored documentation lines, excluding generated BMad support files.
- Engram mirror: pending because the runtime session identity is unavailable after compaction.

## Progress

- Current task: HUR-002.
- Verified outcome: HUR-001 complete; the BMad resolver confirms the active initiative.
- Next step: derive the HU-01 BMad specification from the accepted decisions and existing sources.
