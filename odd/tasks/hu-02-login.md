# HU-02 Login — Authentication Stage

## Objective and authority

Complete the approved HU-02/SCRUM-7 authentication stage using existing Auth.js Credentials, not a parallel token system. **Authentication stage accepted locally:** deterministic proof plus authorized isolated A1 PostgreSQL and A2 real Chrome acceptance passed on `a7bb421`. Stage B habits remains deferred; no production or security approval. Authoritative intent: [HU-02 plan](../../_bmad-output/initiative-habitmaxxing-mvp/plan-hu-02-login.md).

User authorized implementation, a synchronized develop baseline, a new branch, deterministic checks, and local work-unit commits. Parent readback/mirror and bounded follow-ups authorized L1–L3 deterministic source/test writes and local commits. Parent authorized L4 documentary reconciliation only in the five exact Markdown surfaces; no overall acceptance completion. User subsequently authorized isolated local A1/A2, now performed by the acceptance verifier. This bookkeeping authorizes no new DB/browser operation. Push, PR, deployment and production mutations remain unauthorized.

## Baseline and delivery

- Fetched only authorized `Vicente-P/HabitMaxxing` origin/develop using ephemeral existing GitHub CLI credential helper; no persistent credential configuration or token output.
- Baseline: `1d8ea43caa35dd2d5e770d74108770d3450f7eb2`; new branch `codex/hu-02-login`, created without overwriting refs.
- Original HU-01 feature at `f407dc4`, user configuration edit, stack task, and approved plan preserved; no environment copied. Existing ignored Vercel metadata retained without Vercel access.
- RDD read-only status: on, decided by global; native assessment/consent and commit coordination remain parent-owned.
- Forecast: 350–600 authored changed lines including behavior/tests/docs. Delivery strategy: ask-on-risk, resolved 2026-10-06. User approved a future stacked PR chain toward develop (stacked-to-main topology, integration base develop), with local behavior-and-test work-unit commits only. No publication, fixed PR count, inherited three-PR split, or size exception is authorized. Derive coherent slice boundaries from the actual diff without compressing code or omitting tests.
- Engram task mirror written and read back by parent; the plan remains intent authority. L4 explicitly reconciles its historical planning status with observed implementation and pending acceptance; original HU-01 intent stays untouched.

## Approved decisions and acceptance

1. CA-03: internal five consecutive failures establish a 15-minute lock. Unknown email, wrong password, and locked accounts share external "Credenciales incorrectas"; no lock-specific code/status disclosure. Expiry and successful unlocked reset preserved.
2. Native Auth.js transport; REST 400/401 examples illustrative. No new login endpoint, manually signed JWT, or refresh stack. `result?.ok && !result.error` plus actual session proof, not HTTP status alone.
3. HU-02 owns server-bound dashboard auth and unauthenticated `/login` redirect. HU-03 reuses the guard for logout/post-logout verification, not duplicate protection.
4. Accept only Stage A login/protected dashboard after functional proof. Stage B saved habits is unimplemented/deferred to HU-06/authenticated readback; original full CA-01 remains incomplete.

CA-02 requires approved neutral copy; CA-03 requires threshold/active lock/expiry/reset/concurrency proof; CA-04 requires 30-day cookie/session checks and separately authorized browser close/reopen proof. Mock/session configuration tests cannot certify browser or database behavior.

## Constraints and implemented approach

One writer, preserve concurrent work. No schema/dependency/version/environment changes, migrations, manual generated edits, user-data cleanup, secret/hash logs, production account tests, or unrelated source edits. Reuse Prisma singleton and existing User `failedLoginAttempts`/`lockedUntil` fields. Preserve registration recovery on throw/non-ok/semantic sign-in errors.

Implemented policy: database-serialized decision with injected clock and bounded serialization-conflict retries. Atomic increment/reset/lock update, no detached read/plain write. Fifth admitted failure creates lock; active-lock attempts do not extend it; `now >= lockedUntil` starts a fresh sequence. Correct unlocked credentials reset both fields atomically; success racing the fifth failure follows one database ordering. Return a failure decision so transaction increments commit before provider rejection.

Local generated Prisma declarations expose numeric increment, interactive transaction isolation and Serializable, confirming API shape only. Bcrypt inside transactions risks connection contention; keep work bounded and evaluate runtime concurrency under separately authorized isolated PostgreSQL. Retry exhaustion fails closed/neutral; never claim mocks prove actual DB serialization. Existing JWT sessions are not automatically revoked by account lockout.

## Tasks and bounded routes

- [x] **L1 — Lock policy and reset (deterministic implementation proof).** Delegated direct: nontrivial provider/helper/test changes, exact surfaces parent-approved. Observed behavior-assertion RED, implemented GREEN, and preserved HU-01 regressions. Serial ordering fixtures are not actual PostgreSQL proof; live local acceptance subsequently passed A1 below. Local work-unit commit `779ca0b`, `feat(auth): enforce concurrent-safe login lockout`; high native candidate explicitly declined, not approved.
- [x] **L2 — Feedback and session (deterministic implementation proof).** Delegated direct: login UI/Auth.js/test changes, parent follow-up authorized. Observed RED for uniform copy and explicit lifetime, then GREEN preserving semantic errors, infrastructure neutrality, pending restoration, safe identity and HU-01 recovery. Local work-unit `580929b`, `feat(auth): complete login feedback and persistent sessions`; high native candidate explicitly declined, not approved. CA-04 local browser close/reopen and actual cookie/session subsequently passed A2 below.
- [x] **L3 — Dashboard guard (deterministic implementation proof).** Delegated direct: nontrivial server page/colocated test changes, parent bounded follow-up authorized. Observed unauthenticated-access RED and guarded GREEN, including safe identity and authentication-error fail-closed behavior. Local work-unit `c4679b5`, `feat(auth): protect dashboard with server session`; native medium/under_budget, deferred without approval. No habit implementation or HU-03 logout duplication. Local browser/session/restart/keyboard/320 px subsequently passed A2; assistive-technology announcements remain unexercised and Stage B deferred/unimplemented.
- [x] **L4 — Documentary reconciliation only.** Delegated direct: five normative/intent/tracking documents aligned with approved decisions and actual implementation. Structural readback, local links, whitespace and unchanged-source proof; local `a7bb421`, `docs(auth): align HU-02 staged acceptance` work unit. This closes document reconciliation, not acceptance. Source checks reused from unchanged L3; no redundant build or artificial RED.
- [x] **A1 — Isolated real DB acceptance.** Authorized cached local PostgreSQL 16 fixture; two real acceptance runs passed persistence, lock/expiry/reset, concurrent threshold, both success/fifth-failure orderings and recovered actual P2034 conflicts. Evidence/limits below.
- [x] **A2 — Local real Chrome/session acceptance.** Passed anonymous redirect/session null, uniform credential rejection, successful safe session, persistent cookie and actual process close/relaunch with same profile; keyboard/320 px passed. Evidence/limits below.
- [ ] **Stage B — Habit availability dependency.** Deferred/unimplemented HU-06/authenticated readback; original full CA-01 incomplete.

## Proposed future exact edit surfaces

L1: `src/lib/auth.ts`, new `src/lib/login-policy.ts`, new `src/lib/login-policy.test.ts`, `tests/validations.test.ts`, and this task. The helper owns injectable policy/transaction seams; no singleton/config/schema edit is currently needed.
L2: `src/lib/auth.ts`, `src/app/(auth)/login/page.tsx`, `tests/validations.test.ts`, and this task. Add a separate focused Auth.js test file only if parent explicitly includes its exact path.
L3: `src/app/(dashboard)/dashboard/page.tsx`, new `src/app/(dashboard)/dashboard/page.test.tsx`, and this task. Existing Auth.js route and register form remain unchanged unless a confirmed finding receives separate authorization.
L4: `docs/specs/auth/login.md`, `docs/architecture/auth-flow.md`, `docs/wiki/backlog.md`, `_bmad-output/initiative-habitmaxxing-mvp/plan-hu-02-login.md`, and this task. These are proposed surfaces, not current write permissions.

## Verification

Current deterministic runner: Vitest/Testing Library; preserve top-level HU-01 tests rather than moving them. `passWithNoTests: true` means record discovery counts. Source-mutating ESLint normalization for authorized TS/TSX must precede final checks/review freeze; commit hooks must then be no-ops.

Planned focused checks:
- L1: `pnpm exec vitest run src/lib/login-policy.test.ts tests/validations.test.ts`.
- L2: `pnpm exec vitest run tests/validations.test.ts`.
- L3: `pnpm exec vitest run "src/app/(dashboard)/dashboard/page.test.tsx"`.
- All behavioral tasks: `pnpm test -- --run`; `pnpm typecheck`; `pnpm lint`; `pnpm build`; `git diff --check`.
- L4: structural readback/local references/whitespace plus applicable behavioral checks for the final unchanged candidate; no artificial RED for passive documents.

Run checks with exclusively loopback process-only DB/DIRECT_URL placeholders and synthetic local AUTH settings, never actual environment secrets. Existing build/postinstall generates Prisma but does not run migrations. Stop/report any git-visible generated changes without silent revert. Baseline dependencies already present; no install or upgrade performed. No audit script exists; network audit skipped.

Database mocks/controlled interleavings are deterministic policy proof only. Real serialization, session browser restart, cookie transport, and live registration/login require explicit isolated DB/browser authorization. No ambient or production credentials may be reused.

## Preparation evidence and next step

CodeGraph initialized once in this worktree (derived index only); login query found form/schema/auth import. Authorize query returned no results, so focused source/test/type readback filled that gap. No copied index or administrative command.

Baseline observed on synchronized develop before source changes: `pnpm test -- --run` exit 0, two files/23 tests passed; `pnpm typecheck` exit 0; `pnpm lint` exit 0; `pnpm build` exit 0; `git diff --check` exit 0. Generated Prisma remained git-visible unchanged. Existing vite-tsconfig-paths deprecation guidance was informational; no configuration change made. Preparation structural checks passed for both new documents. Parent reconciled the full mirror and the approved future chain strategy before L1.

## L1 evidence and limitations — before isolated acceptance

Local commit `779ca0bdc60e9ecce032c2fbe389d498a523e390`: 418 gross authored lines, including 196 planning/tracking lines. Parent native assessment was high; user explicitly declined this exact candidate with RDD mode unchanged. This is an intentional unreviewed boundary, not security approval. Independent verifier confirmed focused 29/full 39 tests and typecheck/lint/build/diff checks exit 0 on the clean commit; mocks do not establish actual DB isolation. L2's next parent-owned native candidate starts at `779ca0b`, not the accumulated branch point.

- Meaningful RED: policy API stub returned null; focused runner exit 1, 13 failed assertions/14 passed across 27 tests. Failures asserted counter changes, identity, expiry, ordering, clock, dummy comparison and retries, not missing-module resolution.
- GREEN/refactor: focused runner exit 0, 29 tests; full runner exit 0, 39 tests across three files, retaining the 23-test HU-01 baseline. Added 16 policy cases including both success/fifth-failure orderings and only actual Prisma P2034 retry.
- Final authorized ESLint normalization preceded final tests; typecheck/lint/build/diff checks exit 0, lint without warnings, generated Prisma unchanged. An earlier unused mock argument warning was removed before the final rerun; informational vite-tsconfig-paths notice remains.
- Policy validates before DB access, compares a fixed cost-12 dummy hash for absent accounts, returns safe identity only after successful reset transaction, and returns rejection decisions so failure counters commit. Serializable transaction uses three maximum attempts, 5-second maxWait/timeout, fresh post-read clock and full post-comparison lock duration; unexpected errors/exhaustion fail closed without leaked details.
- Bcrypt work can hold a transaction connection; actual serializable contention/performance and database rollback/isolation require separately authorized fixtures. Existing JWT sessions are not revoked by lockout. Browser/remote DB/production acceptance was not performed; Live A1/A2 and Stage B remain pending. Parent owns native assessment; no new review approval is claimed.

## L2 evidence and limitations — before isolated acceptance

Local commit `580929b2503cc581aa2ebe3787e1beef3a56c940`: high native candidate explicitly declined by the user, mode on unchanged, no approval. Independent verifier confirmed focused 16/full 42 tests and typecheck/lint/build/diff checks exit 0 on the clean commit. L3's parent-owned native candidate starts at this intentionally unreviewed boundary.

- RED: focused runner exit 1, four failed assertions/11 passed (15 total): two HTTP-ok/non-ok semantic-error copies, pending non-ok copy, and absent explicit `session.maxAge`. A repeated pre-fix run reproduced those same four failures; no missing-module failure was counted.
- GREEN after final authorized ESLint normalization: focused runner exit 0, 16 tests; full runner exit 0, 42 tests across three files. Typecheck/lint/build/diff checks exit 0, no lint warnings or generated Prisma modifications. A new success-path assertion initially assumed no alert node; the existing empty live region is correct, so the test now verifies empty content without changing UI semantics.
- Minimal behavior changes: non-ok/semantic credential rejection shows "Credenciales incorrectas"; thrown infrastructure failure retains neutral generic feedback. Explicit native JWT session lifetime is 2,592,000 seconds; existing success guard and registration recovery remain unchanged. Captured actual NextAuth configuration tests safe token/session identity, no provider password/counters/lock leakage, missing identity, pending duplicate prevention and successful navigation.
- Installed `@auth/core` 0.40.0 initialization derives JWT maxAge from session.maxAge; native callback/session actions derive cookie expiry from that lifetime and refresh it on session access. This is rolling native session behavior, not a custom fixed-expiry implementation. Local source/configuration proof does not establish browser restart, real cookie security/transport, or live session payload.
- Normalization first attempted through pnpm's Windows command wrapper failed parsing the parenthesized path (exit 255); direct installed ESLint Node entry point succeeded before final checks. No source normalization remained for the commit hook. Runtime harness/live DB/browser checks are N/A here because environment access is not authorized; CA-04 live proof and Stage B remain pending.
- Rollback boundary: revert this unit's login copy/session configuration/tests/task evidence without changing L1 lock policy, stored locks, cookies or registration recovery. L2 candidate range `779ca0b..580929b` was explicitly declined as recorded above. L2 is 84 gross authored lines (19 task, 65 source/tests); running L1+L2 budget is 502. Future stacked PR boundaries remain unset and publication unauthorized.

## L3 evidence and limitations — before isolated acceptance

- Meaningful RED: focused runner exit 1, all seven initial tests failed because the unguarded page returned Dashboard without authenticating or redirecting, including the authentication-error case. Windows wrapper initially rejected the parenthesized test path before Vitest ran; preserving literal inner quotes ran the same requested test, and the shell error is not counted as RED.
- GREEN after installed ESLint Node normalization: focused runner exit 0, nine tests including missing/null user, absent/empty/whitespace/nonstring ID, authenticated placeholder and propagated authentication failure. Full runner exit 0, 51 tests across four files; typecheck/lint/build/diff checks exit 0, no lint warnings, generated Prisma unchanged. Existing vite-tsconfig-paths notice remains informational.
- The async server page awaits existing `auth()`, requires a nonempty string user ID matching the Auth.js callback identity contract, and redirects invalid sessions to `/login` before returning content. Authentication errors propagate without rendering the placeholder. Build now reports `/dashboard` as dynamic (`ƒ`), not static. No client/proxy duplicate guard, extra session fields or habit data were introduced.
- Tests invoke the server component and render its authenticated result; redirect throws to model Next.js control flow. This is mocked server-boundary proof, not live Next HTTP/browser/session-cookie proof. No app/DB/browser operation was performed. CA-01 Stage A live acceptance, CA-04 restart/accessibility and Stage B habits remain pending; L4 documentary reconciliation follows; acceptance is not implied.
- Rollback boundary: this page guard, colocated tests and task evidence only; preserve L1/L2, HU-01 and user records. Runtime harness is N/A without separately authorized environment access. Parent assessed `580929b..c4679b5` medium/82 lines, review_due false under_budget. It remains pending in the slice with base `580929b`; no boundary advance or approval. L3 is 82 gross authored lines (18 task, 64 page/tests); running L1–L3 budget is 584. Future stacked PR boundaries remain unset; no publication occurred.

## L4 reconciliation and handoff — prior to isolated acceptance

The login spec, architecture and backlog now describe uniform credential rejection, internal five-failure/15-minute policy with expiry/reset, native rolling 30-day session and the HU-02 server guard reused by future HU-03. Removed active REST wrapper/custom-token/lock-disclosure contracts; historical examples are explicitly superseded. Stage A is implemented pending A1/A2, Stage B deferred; no full HU-02 completion.

L1/L2 native candidates were explicitly declined (not approved), with independent functional proof. L3 is medium under_budget; next parent-owned native range starts at `580929b` and includes L3 plus L4. No new native action is performed by this worker. Last source proof is L3 focused9/full51 and typecheck/lint/build/diff exit 0; passive documentation reuses it only if source/package/generated blobs stay equal to `c4679b5`.

Future authorized stacked delivery has no fixed PR count or published heads. One honest partition forecast: initial planning/tracking 196 lines can form a dependency-aware docs slice, L1 behavior/tests 222, L2 84, L3 82; add actual L4 scope before final slicing. No branch reconstruction, publication, credentials, DB/browser acceptance or deployment in L4. Documentation rollback is limited to these five Markdown files, preserving frozen HU-01/source and persisted user state.

L4 structural proof: five Markdown files read back, 14 local file references resolve, balanced fences, no trailing whitespace, diff check exit 0 and source/package/generated/frozen HU-01 blobs unchanged from `c4679b5`. L4 is 283 gross lines; cumulative work-unit budget 867. Combining initial docs 196 with L4 283 would exceed 400; keep them as coherent dependency-aware docs units in the future slicing pass rather than omitting evidence. Local documentation commit identity is returned for parent readback/mirror; runtime acceptance remains pending.

## Isolated local acceptance — 2026-10-06

Delegated verifier ran exact source `a7bb421` twice, exit 0, using cached `postgres:16-alpine` on local Docker 29.8.1 (no install/pull). Disposable fixture `hu02-accept-47501a27f802`, database `hu02test`, bound `127.0.0.1:50063`; local Next start `50064`. Synthetic process-only environment, no loadable environment files or remote credentials. Existing policy/validation was transpiled in memory by an external harness, not changed in the repository.

A1 persisted failures 1–5 and a 900,000 ms lock; correct credentials while locked were denied without extending its deadline. Injected exact-expiry clock established a fresh sequence and successful reset. Real concurrent threshold and success/fifth-failure races passed, including controlled success-first (identity then counter 1) and failure-first (lock 5, correct request denied). Strengthened run observed six actual Prisma P2034 conflicts, four in races; bounded retries recovered, no exhaustion observed. This is real local DB evidence, not production load or an additional injected infrastructure/rollback test.

A2 used installed Chrome/Playwright persistent profile: anonymous dashboard redirected to login/session null; unknown/wrong/locked all showed "Credenciales incorrectas". Successful login reached dashboard and safe expected synthetic identity without password/counter/lock fields. Cookie HttpOnly/SameSite=Lax had persistent expiry greater than 29 days. Chrome context/process closed and a new process reopened the same profile with authentication intact, without storageState or serialized-cookie restoration. Keyboard email/password/submit and 320 px passed.

Limits: HTTP-local Secure=false is expected, not production Secure proof; expiry metadata is not 30 elapsed days; assistive-technology announcements were not exercised. App/browser stopped, listeners 0, exact Docker fixture/volume removed. Runtime policy blocked deletion of the owned temporary fixture/profile directory; it remains locally, without retry/bypass or reading its contents in this task. No production acceptance, source edits or publication.

L4 commit `a7bb421` and its L3/L4 native candidate were explicitly declined, as were L1/L2; none grants approval. Independent final proof: 51 tests and all source checks exit 0, clean source/generated. This passive bookkeeping reuses unchanged proof; structural checks only. Acceptance commit identity is returned for parent mirror/handoff. Stage A accepted LOCAL ONLY; Stage B/HU-06 remains unchecked and original full CA-01 incomplete.

Rollback boundaries follow the exact behavior/test/docs work units; do not clear persisted counters/locks or revoke cookies as an implied code rollback. Any data repair, production acceptance, or release requires separate authorization.

## Local stacked-delivery preparation

- [x] **D1 — Local slice plan and PR drafts.** Delegated direct: mapping the complete final diff, dependency/reference closure and delivery drafts exceeds the parent inline mapping budget. User authorized local preparation and this task-only passive commit; no remote lookup, credentials, issue/label writes, branch reconstruction, push, PR or deployment. Future reconstruction needs a separate bounded follow-up.

Fixed integration base: `1d8ea43caa35dd2d5e770d74108770d3450f7eb2`. Canonical implementation/acceptance/document blobs: `ec85d763d8865ebd16926868e8f47c746b5490c6`; this preparation changes only the task blob. Preserve all other final changed bytes and modes and original `codex/hu-02-login` history.

One honest partition yields three cohesive slices, no tracker or exception. Net additions plus deletions from the fixed base—not cumulative work-unit counts—determine budgets. Final prepared net diff: 833 lines, partitioned 351/299/183; S2 includes all 170 task lines plus 129 plan lines. The complete tested implementation fits alone. Evidence/intent precedes normative reconciliation so the plan/task cross-links both exist; normative paths referenced there already exist in the base. Intermediate documentation acknowledges the canonical complete stack, not a claim that every later contract change is already materialized.

| Slice / English PR title | Proposed head → base | Net lines / deliverable boundary | Verification / rollback |
|---|---|---|---|
| S1 — `feat(auth): implement login policy and protected dashboard` | `codex/hu-02-authentication` → `develop` | 351; starts at fixed base, ends with all policy/UI/session/guard behavior and tests | Reconstructed full 51-test suite, typecheck/lint/build/diff, generated parity; rollback these seven source/test paths only |
| S2 — `docs(auth): record login intent and isolated acceptance` | `codex/hu-02-evidence` → `codex/hu-02-authentication` | 299; starts at S1, ends with authoritative intent and canonical local acceptance evidence | Structural links/fences/whitespace/diff and source parity; rollback these two documentation paths only |
| S3 — `docs(auth): align login contracts with accepted authentication stage` | `codex/hu-02-contracts` → `codex/hu-02-evidence` | 183; starts at S2, ends with aligned normative contracts/backlog, not implemented habits | Structural checks and unchanged-source parity; rollback these three normative paths only |

Exact path sets:
- S1: `src/lib/auth.ts`, `src/lib/login-policy.ts`, `src/lib/login-policy.test.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/dashboard/page.test.tsx`, `tests/validations.test.ts`.
- S2: `_bmad-output/initiative-habitmaxxing-mvp/plan-hu-02-login.md`, `odd/tasks/hu-02-login.md` including every preparation/draft line here.
- S3: `docs/specs/auth/login.md`, `docs/architecture/auth-flow.md`, `docs/wiki/backlog.md`.

Chain diagram template: `develop ← S1 authentication ← S2 evidence ← S3 contracts`; replace exactly one slice with `📍` in each future PR and insert verified previous/next PR links after publication. Heads do not yet exist; exact remote base/drift and head availability must be checked only after authorization. The user-selected `codex/` names intentionally override the skill's generic type-prefix example.

### Draft bodies — shared fields

`Closes #<approved-HU02-issue>` is an unresolved placeholder, not HU-01 issue #11. Jira reference: [SCRUM-7](https://vperezc18.atlassian.net/browse/SCRUM-7). Append these drafts to any actual repository PR template discovered before publication; no template file was found at the conventional singular local path.

- Chain: HU-02 stacked to develop, three slices, tracker not needed. State the row's base/start/end, previous/next dependency and exact changes table from its path set.
- Scope: locally accepted authentication Stage A; Stage B actual habit availability deferred to HU-06/authenticated readback, original full CA-01 incomplete. HU-03 logout, production acceptance/deployment and credential changes are out of scope.
- Existing proof applies to canonical unchanged bytes: 51 tests/typecheck/lint/build/diff passed and real isolated PostgreSQL/Chrome A1/A2 passed. Not future CI success; reverify materialized slices before publication. Native candidates were explicitly declined, no security approval/receipt.
- Limits: HTTP-local Secure=false is not production Secure proof; no 30 elapsed days or assistive-technology announcements. Owned temporary profile/fixture directory retained after policy-blocked deletion; do not expose contents or imply cleanup.
- [ ] Link a verified HU-02 issue carrying `status:approved` and add exactly one verified `type:*` label.
- [ ] Reconstructed slice verification, applicable CI and byte/mode parity pass; Conventional Commit, no attribution. Shellcheck N/A because no shell-script changes, not a claimed PASS.

### Draft slice summaries

**S1:** seven-path changes table covers serialized lock/reset policy and tests, provider integration, uniform feedback, rolling 30-day native session and server dashboard guard. Planned label: only `type:feature`. Previous: none; next: S2 evidence. Normative closure docs follow because including all of them with 351 behavior/test lines would exceed 400; no tests or behaviors omitted.

**S2:** two-path changes table covers approved intent and detailed observed acceptance/teardown/review limits. Planned label: only `type:docs`. Previous: S1; next: S3 contracts. These evidence documents describe canonical accepted source; until S3 lands, normative reconciliation is the explicit remaining stack dependency.

**S3:** three-path changes table aligns native transport, private lockout, HU-02/HU-03 ownership and staged acceptance. Planned label: only `type:docs`. Previous: S2; next: none. No behavioral changes or full-habits/story completion claim.

### Publication prerequisites — not authorized or performed

Remote authorization must name GitHub destination, operations and session, including approved HU-02 issue discovery/creation if needed. Discover a suitable issue across open/closed states, obtain approval and `status:approved`; verify exact existing `type:feature`/`type:docs` labels before use, without assuming issue #11 applies. Verify actual PR template, branch-name/protection/check policy and destination/base before publication; no remote lookup has occurred here.

Local workflow currently scopes pull-request CI to develop/main and pushes to develop/feature/**, not these codex stack heads. Dependent S2/S3 bases may not trigger full CI. Retargeting alone previously did not trigger it: later publication/merge coordination must verify head-specific applicable checks, report skipped/pending honestly and obtain authority for any additional CI-triggering operation. No merge/deploy authorization is implied.
