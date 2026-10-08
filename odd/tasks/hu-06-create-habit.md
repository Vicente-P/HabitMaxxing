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
- Local tracker: codex/hu-06-create-habit. Slice1 codex/hu-06-create-api ends91374a5; slice2 codex/hu-06-catalog starts91374a5/endsbec5ca0; slice3 codex/hu-06-dashboard startsbec5ca0/ends1338a68. Later slices depend on their predecessor. No remote PRs.
- Delivery strategy: auto-chain; user approved chain strategy feature-branch-chain. No remote tracker/child PR authorized.
- Forecast: 1,140–1,750 authored additions+deletions including tests/docs; three cohesive slices. Review-size heuristic must not remove tests/docs or cause code golf; report any cohesive >400-line slice exception before PR creation.
- Running authored lines: 1,209 across implementation commits = HU06-01 518 + HU06-02 213 + HU06-03 478 (including tracking; gross commit totals, not net diff). No native-approved boundary. HU06-01 candidate-scoped review declined; next separate work-unit candidate base is 91374a5b03a0301ad3ec0a43b2abc12f76f66a92, not a security approval.
- Engram full-document mirror: PENDING. Runtime explicitly supplies no registered session identity and prohibits agent-attributed writes; no substitute session/CLI save.
- RDD: on (global). Native assessment selects risk and review; candidate consent remains separate. Pre-existing untracked skills excluded from review scope.

## Tasks and acceptance
- [x] HU06-01 — Protected creation API: strict schema, bounded JSON/exact-origin helper, active-account ownership, POST, tests and configuration/contract docs.
  - Route: delegated direct. Trigger: multi-file new logic and read-to-write preparation.
  - Acceptance: 201 for normalized own creation; rejected auth/origin/body/fields cannot insert; neutral failures; no-store; explicit APP_ORIGIN per deployment.
  - Verification: meaningful focused Vitest RED→GREEN, typecheck, lint, prisma validate, diff check. Native RDD assessment/consent as applicable.
  - Local implementation observed: strict POST and protection complete; focused Vitest RED (30 schema failures + 3 missing-module suites) → GREEN (4 files, 113 passed); full Vitest 9 files/175 passed; typecheck, lint, prisma validate and diff check exit 0. Parent focused spot check: 113 passed. ESLint --fix normalization: zero byte changes (SHA-256 checked). No real DB/browser proof.
  - Commit: 91374a5b03a0301ad3ec0a43b2abc12f76f66a92. Native tier high, review declined_this_candidate by user (no review record/approval). Independent functional verifier: focused113/full175, typecheck/lint/prisma validate/diff check exit0; no functional deviations found. Authored implementation diff: 466 lines excluding task document; cohesive API slice exceeds advisory 400, retain tests/docs and report size exception before any PR. Rollback: creation endpoint/helpers/tests and matching docs only.
- [x] HU06-02 — Durable owned catalog API: exact view=catalog query, deterministic unfiltered owner read, 200 empty array, reserved bare GET 400, tests/docs.
  - Route: delegated direct. Trigger: multi-file behavior with authorization boundaries.
  - Acceptance: foreign-user data excluded; anonymous GET (including bare) 401; account existence verified; no shared caching or daily semantics.
  - Verification: meaningful route/service Vitest RED→GREEN, full Vitest, typecheck, lint, diff check; native RDD as applicable.
  - Local implementation observed: catalog GET complete; focused RED36 new failures/35 existing passed → GREEN71 passed; full Vitest211 passed; typecheck/lint exit0. ESLint --fix zero byte changes. Global diff-check initially found parent task EOF blank line; parent corrected it and reran diff-check exit0 plus focused71 spot-check.
  - Commit: bec5ca0691a6c9753c81061e74c186dc1e88d940. Native risk medium, review_due=false/under_budget (213 authored lines including tracking); no review/approval claimed. Combined catalog/dashboard native slice91374a5..1338a68: medium, 681 net authored lines, slice_budget_reached; user explicitly declined_this_candidate. No native review/approval. Authored implementation diff:197 lines excluding task document. Rollback: GET catalog behavior/tests and matching docs, keeping POST.
- [ ] HU06-03 — Accessible dashboard form/catalog: existing design system, conditional unit, weekday controls, pending/error/retry, fetch catalog after confirmed creation and on revisit.
  - Route: delegated direct. Trigger: multi-file UI and interaction tests.
  - Acceptance: created off-day habit remains visible; reload readback; guard regressions preserved; keyboard/narrow layout; ambiguous POST is not automatically retried or claimed successful.
  - Verification: meaningful UI Vitest RED→GREEN, full Vitest, typecheck, lint, prisma validate, build and diff check when locally safe; native RDD as applicable.
  - Local implementation observed: form/catalog/dashboard complete. RED1 new dashboard assertion +2 absent UI modules (8 guards pass) → GREEN36 UI tests; full238 pass; typecheck/lint/prisma validate/diff check exit0; six-file ESLint --fix zero byte changes; parent focused36 spot-check passed.
  - Build SKIPPED before launch: layout uses next/font/google Inter (network download possible), Next may load real .env independently of DOTENV_CONFIG_PATH. No safe isolated build authorized. Real DB/browser/logout/320px visual checks and preview configuration pending; generated Prisma unchanged.
  - Commit:1338a68ccd923bd3e11f9c935727c198150b26bf. Catalog+UI native risk medium, review declined_this_candidate by user; ordinary functional checks remain the evidence, no native review record/security approval. This task remains unchecked until outstanding build/runtime acceptance is resolved. UI authored implementation462 lines excluding tracking; cohesive >400-line slice retains tests/docs, report size exception before remote PR. Rollback: form/catalog integration/tests and backlog docs, keeping API.

## Verification boundaries and next step
- HU06-01 local checks above passed; native review explicitly declined for this candidate, independent functional checks passed. Build and real DB/browser checks not run. HU06-02 functional checks passed/native under_budget; HU06-03 implementation/local checks passed; build/runtime acceptance pending.
- Build regenerates Prisma: allowed command generation, no manual edits, require zero git-visible generated changes. No installs/network/DB probes.
- Explicit APP_ORIGIN per preview is documented, not configured remotely; mutation fails closed until provided.
- Mock tests cannot prove real DB persistence/browser-cookie logout. Real isolated DB/browser acceptance remains separately authorized and pending; HU-03 GET-after-logout checkbox stays open until that evidence exists.
- API idempotency/distributed rate limiting and copied-token revocation are out of scope; manual retry after ambiguous outcome may duplicate an inserted habit.
- Next: obtain explicit authorization/supply for a portable Node22 runtime. Then fix isolated network guard to allow compiler loopback IPC while retaining Google-only outbound and no DB, rerun isolated default build once, and separately decide DB/browser acceptance. No runtime install currently authorized.

## Delivery status
- All three implementation work units committed locally; branch chain and original user skills preserved. No push, PR or deployment.
- Native reviews were declined per candidate (creation; catalog+dashboard). Global mode remains on. No security approval/receipt exists.
- HU06-03/full HU-06 acceptance remains pending build and real persistence/browser evidence; HU-03 GET-after-real-logout still pending.
- Engram mirror remains pending because no authoritative runtime session identity is registered.

## Isolated build evidence
- User authorized only a local tracked-file build with synthetic environment and unauthenticated public font downloads from fonts.googleapis.com/fonts.gstatic.com; no DB, production, runtime install, or other network destination.
- Exact snapshot: bc005e5cd1e75a94685216ec11433b6f3552eb51 (410 tracked files, .env.example only; no actual env/credential files copied).
- First output workspace: C:\Users\vpere\.codex\hu06-builds\build-bc005e5. Copied Prisma generation exit0; default Next16.2.6 build exit1 because node_modules junction points outside Turbopack filesystem root.
- Local dependency recovery: C:\Users\vpere\.codex\hu06-builds\build-bc005e5-local-deps; 33,571 files/785,603,711 bytes, 1,733 remapped links verified inside copy. Prisma generation exit0; Next build exit1 because verification guard denied verified Turbopack loopback IPC during CSS compilation. This is an observed harness failure, not an application defect. Retained build.log; no alternate bundler/mocked fonts used.
- Both attempts used system Node24.13.0, not required Node22. Bounded runtime lookup found only system24.13.0 and bundled24.19.0; no22. Stopped before guard changes/final retry; no runtime downloaded and no build-ipc.log created.
- Original source HEAD/status and original .next/generated Prisma SHA-256 fingerprints unchanged; existing untracked BMAD skills preserved. No DB/browser/logout proof, completed production build, emitted route proof, native security approval, push or deploy.
- Build/runtime acceptance remains BLOCKED on a Node22 runtime. Prior local test results do not establish Node22 verification. Node allowlist was defense-in-depth, not OS-wide native network enforcement.
