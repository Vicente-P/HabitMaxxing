# HU-06 / SCRUM-11 — Create habits

## Objective and problem
Deliver authenticated habit creation with durable owner-scoped dashboard visibility. A creation confirmation is distinct from HU-09's scheduled daily agenda.

## Authorized scope and constraints
- User approved implementation, strict validation/security contract, previews, and feature-branch-chain delivery.
- Name: trimmed string, 1–100 characters. Numeric unit: trimmed string, 1–30 characters. Binary input omits unit; stored unit is null.
- Frequency: 1–7 distinct integer weekdays 0–6, Sunday=0; canonical ascending storage. Unknown fields rejected.
- POST /api/habits creates; GET /api/habits?view=catalog reads all own habits. Authenticated bare/unsupported GET returns 400; anonymous GET/POST returns 401.
- Identity comes only from server session; verify account exists. Owner-scoped reads/writes, neutral errors, private no-store responses.
- POST requires JSON, exact configured server-owned APP_ORIGIN, and streamed 8 KiB maximum. No request-header origin inference or wildcard preview trust.
- No HU-09 daily filtering/logs, edit/delete/statistics, schema migration, new dependencies, manual generated-client edits, remote operations, deployment, push, or PR creation.
- Preserve existing untracked .agents/skills/bmad-agent-pm/ and .agents/skills/bmad-prd/; never read or modify real secret environment files.
- Existing publication pending statements are historical. User supplied integrated/deployed SHA 468a57ce3e5ad57000c2b8dd65e682e2ba946080; no independent remote verification here.
- HU-03 native review was explicitly omitted; do not infer security approval or copied-JWT revocation.

## Delivery and recovery
- Base: 468a57ce3e5ad57000c2b8dd65e682e2ba946080, locally available. Stale develop is not the base.
- Local tracker: codex/hu-06-create-habit. First slice: codex/hu-06-create-api. Later slices depend on their predecessor.
- Delivery strategy: auto-chain; user approved chain strategy feature-branch-chain. No remote tracker/child PR authorized.
- Forecast: 1,140–1,750 authored additions+deletions including tests/docs; three cohesive slices. Review-size heuristic must not remove tests/docs or cause code golf; report any cohesive >400-line slice exception before PR creation.
- Running authored lines: 0. Reviewed boundary: base above.
- Engram full-document mirror: PENDING. Runtime explicitly supplies no registered session identity and prohibits agent-attributed writes; no substitute session/CLI save.
- RDD: on (global). Native assessment selects risk and review; candidate consent remains separate. Pre-existing untracked skills excluded from review scope.

## Tasks and acceptance
- [ ] HU06-01 — Protected creation API: strict schema, bounded JSON/exact-origin helper, active-account ownership, POST, tests and configuration/contract docs.
  - Route: delegated direct. Trigger: multi-file new logic and read-to-write preparation.
  - Acceptance: 201 for normalized own creation; rejected auth/origin/body/fields cannot insert; neutral failures; no-store; explicit APP_ORIGIN per deployment.
  - Verification: meaningful focused Vitest RED→GREEN, typecheck, lint, prisma validate, diff check. Native RDD assessment/consent as applicable.
  - Local implementation observed: strict POST and protection complete; focused Vitest RED (30 schema failures + 3 missing-module suites) → GREEN (4 files, 113 passed); full Vitest 9 files/175 passed; typecheck, lint, prisma validate and diff check exit 0. Parent focused spot check: 113 passed. ESLint --fix normalization: zero byte changes (SHA-256 checked). No real DB/browser proof.
  - Native review and commit evidence: pending. Authored implementation diff: 466 lines excluding task document; cohesive API slice exceeds advisory 400, retain tests/docs and report size exception before any PR. Rollback: creation endpoint/helpers/tests and matching docs only.
- [ ] HU06-02 — Durable owned catalog API: exact view=catalog query, deterministic unfiltered owner read, 200 empty array, reserved bare GET 400, tests/docs.
  - Route: delegated direct. Trigger: multi-file behavior with authorization boundaries.
  - Acceptance: foreign-user data excluded; anonymous GET (including bare) 401; account existence verified; no shared caching or daily semantics.
  - Verification: meaningful route/service Vitest RED→GREEN, full Vitest, typecheck, lint, diff check; native RDD as applicable.
  - Commit/evidence: pending. Rollback: GET catalog behavior/tests and matching docs, keeping POST.
- [ ] HU06-03 — Accessible dashboard form/catalog: existing design system, conditional unit, weekday controls, pending/error/retry, fetch catalog after confirmed creation and on revisit.
  - Route: delegated direct. Trigger: multi-file UI and interaction tests.
  - Acceptance: created off-day habit remains visible; reload readback; guard regressions preserved; keyboard/narrow layout; ambiguous POST is not automatically retried or claimed successful.
  - Verification: meaningful UI Vitest RED→GREEN, full Vitest, typecheck, lint, prisma validate, build and diff check when locally safe; native RDD as applicable.
  - Commit/evidence: pending. Rollback: form/catalog integration/tests and backlog docs, keeping API.

## Verification boundaries and next step
- HU06-01 local checks above passed; native review pending. Build and real DB/browser checks not run. HU06-02/03 have not started.
- Build regenerates Prisma: allowed command generation, no manual edits, require zero git-visible generated changes. No installs/network/DB probes.
- Explicit APP_ORIGIN per preview is documented, not configured remotely; mutation fails closed until provided.
- Mock tests cannot prove real DB persistence/browser-cookie logout. Real isolated DB/browser acceptance remains separately authorized and pending; HU-03 GET-after-logout checkbox stays open until that evidence exists.
- API idempotency/distributed rate limiting and copied-token revocation are out of scope; manual retry after ambiguous outcome may duplicate an inserted habit.
- Next: commit normalized HU06-01, run native committed-candidate assessment/preflight, obtain candidate consent if requested, then begin HU06-02.

