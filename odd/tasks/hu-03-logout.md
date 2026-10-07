# HU-03 / SCRUM-8 — Native logout

## Objective and authorization

Protect shared-device use by letting an authenticated user leave this browser session and return to `/login`, then deny fresh protected dashboard access.
The owner authorized native Auth.js local implementation, tests and Conventional work-unit commits on 2026-10-07. Parent readback is complete; stacked integration delivery toward `develop` is approved. L1 is now authorized; no remote publication or runtime acceptance.
Authoritative intent: [HU-03 plan](../../_bmad-output/initiative-habitmaxxing-mvp/plan-hu-03-logout.md); [PM review and decisions](../../_bmad-output/initiative-habitmaxxing-mvp/review-hu-03-requirements.md).

## Approved boundaries

- PM-01: remove this browser's Auth.js cookie/session only; no copied-JWT or other-device revocation.
- PM-02: logout/dashboard stage acceptance requires observed proof; `/api/habits` remains unchecked until HU-06 and original full-story completion remains incomplete.
- PM-03: unconfirmed logout exposes neutral non-success feedback and re-enables retry. Login arrival/redirect alone does not prove session termination; exact neutral Spanish copy is finalized during implementation.
- Native approach: installed `next-auth/react` signout, existing server guard reuse; no custom logout endpoint, copied CSRF logic or second token stack.

## Baseline and constraints

- Branch: `codex/hu-03-logout`; pinned base `d3f3c3df668096fc6f97980defdae0f326a7a24c`, tree `1fbd672fea23c8cc24e35d84c64ec071f496e1da`.
- No fetch occurred; this is a verified known integration base, not a claim of latest remote develop.
- Preserve other work, installed untracked PM/PRD skills, original user configuration and existing authentication regressions. Never include skill installation directories in feature commits.
- No remotes, publication, deployment, production/account tests, live database/browser acceptance, environment reads/copies, new dependencies, schema/migrations or generated-file edits.
- Future builds use process-only synthetic loopback placeholders, never real credentials or DB probes. Prisma generation is permitted only with zero git-visible generated changes; stop and report otherwise.
- English technical artifacts; extend existing UI with neutral Spanish. No AI attribution, amend, rewrite or unrelated revert.

## Exact surfaces

Bootstrap bookkeeping: this task, the linked plan and PM review only.
Later local implementation surfaces (parent authorizes each bounded phase):

- `src/app/(dashboard)/dashboard/logout-button.tsx`
- `src/app/(dashboard)/dashboard/logout-button.test.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/page.test.tsx`
- `docs/specs/auth/logout.md`
- `docs/architecture/auth-flow.md`
- `docs/wiki/backlog.md`

No additional test fixture/configuration path is authorized; derive and request a bounded extension if needed.

## Tasks and route

- [ ] **G1 — Bootstrap/handoff.** Branch and task created; parent readback/delivery decision and full Engram mirror pending. Route delegated: preparation for coordinated multi-file implementation. No source or commit yet.
- [x] **L1 — Native logout behavior and tests.** Delegated writer: client behavior plus colocated tests are two nontrivial logic files. Observe meaningful Vitest RED for native invocation, pending/duplicate and PM-03 retry feedback; implement GREEN/refactor without custom cookie logic.
- [ ] **L2 — Dashboard integration and contract alignment.** Delegated writer: server page/test plus three normative docs. RED for changed authenticated output; preserve anonymous/error guard cases, reconcile approved semantics and stale transport notes without claiming acceptance.
- [ ] **A1 — Isolated real acceptance.** Pending separate runtime permission; delegated verifier because browser/session/DB boundaries require actual execution. Verify cookie removal/session null, fresh/direct/Back dashboard denial, repeated/no-session behavior, keyboard and 320 px on the final candidate.
- [ ] **L3 — Evidence-based staged closure.** Delegated documentary work across plan/task/contracts; record observed stage results only, retain HU-06 habits dependency and original full-story incompleteness.

## Verification and commits

Meaningful behavior changes use RED → GREEN → refactor with observed assertions; shell errors or missing modules alone are not valid RED. Bootstrap documents use structural checks only; no artificial RED.

```text
pnpm exec vitest run "src/app/(dashboard)/dashboard/logout-button.test.tsx" "src/app/(dashboard)/dashboard/page.test.tsx" tests/validations.test.ts
pnpm test -- --run
pnpm typecheck
pnpm lint
pnpm build
git diff --check
```

Run focused tests as applicable, then all applicable foreground source checks before each behavior work-unit commit. Normalize only authorized source before verification/candidate freeze; commit hooks must be convergent/no-op.
Local commits keep behavior/tests/relevant docs together and use Conventional messages. Parent owns native mode readback, committed-slice assessment and candidate-specific consent; no prior review supplies HU-03 approval. No lifecycle is started in bootstrap.
Runtime proof remains pending: mocked calls do not certify cookies, CSRF, browser caching or session/access denial. No runtime or source-suite pass is recorded here.

## Delivery, rollback and next gate

Delivery strategy: `ask-on-risk`; chain strategy `stacked-to-main` with integration target `develop` (owner-approved 2026-10-07), no inherited HU-02 topology or PR count. Forecast includes 209 existing plan/review lines, this task, about 180–300 behavior/test changed lines and 40–90 normative-doc changed lines: approximately 500–700 gross authored lines. Count actual net additions plus deletions at each work unit; never omit proof or compress to meet budget.
Parent resolved the delivery choice before the first commit: stacked integration PRs toward `develop`; exact coherent slices will follow observed counts. Publication is not authorized by that planning choice. Keep complete behavior and tests in a cohesive slice; evidence/contract dependencies must remain honest and independently checkable.
Rollback future approved work-unit commits only: remove logout control/integration/tests and restore their approved documentation boundaries; preserve the existing server guard/login policy and do not delete accounts or session data.
Bootstrap commit: `33740e0c19bcae4d991ff50697a2ec06d3d460fb` (three planning documents, 280 additions); structural checks passed and hook changed no source. L1 implemented/tested the standalone control only; dashboard integration/L2 and real acceptance remain pending.
**Memory status:** full Engram mirror pending because authoritative runtime binding is unavailable; no memory mutation or remembered session identity is used. G1 records local completion only; parent explicitly acknowledged the blocked mirror and authorized safe local L1 continuation.

## L1 evidence and handoff

Installed `signOut` parses JSON without checking HTTP success; installed `getSession` returns null after transport errors. The control therefore uses native nonredirecting signout, then an explicit same-origin, no-store session GET with redirects rejected. Only successful nonredirected JSON `null` permits `/login` navigation; active/malformed/failed reads show neutral Spanish retry feedback. No manual cookie or CSRF logic.
Observed RED: 11 failed tests on the runnable inert button; 10 behavioral assertion failures (missing navigation/feedback/pending) plus one unmount fixture callback unavailable because no handler ran. GREEN: focused 11/11; full 62/62 (baseline 51 retained). First typecheck failed with two TS2352 mock casts; explicit `unknown` bridge corrected only test typing, then normalization and all final checks passed.
Final foreground results: focused `pnpm exec vitest run "src/app/(dashboard)/dashboard/logout-button.test.tsx"` 0; `pnpm test -- --run` 0; `pnpm typecheck` 0; `pnpm lint` 0; `pnpm build` 0; `git diff --check` 0. Build generated Prisma with zero git-visible changes; dashboard remains dynamic and unchanged.
L1 rollback boundary: remove the two standalone control/test files and their task/plan evidence, preserving existing dashboard/authentication. L1 local commit: `953cf4ca730d316134a4d36e542e4a535959eb1e` (195 gross lines; 140 standalone source/test additions); native assessment/consent parent-owned against bootstrap `33740e0`, no review approval claimed.
Tests mock native invocation/session responses, including null, remaining session, HTTP failure, redirect, malformed/missing/invalid JSON, rejection, pending duplicates, retry and unmount. They are not cookie/CSRF/browser/runtime proof. A1 remains unauthorized and unchecked; no staged/story acceptance is claimed. Mirror remains pending.
Encoding readback corrected bootstrap task/plan mojibake introduced by the Windows locale-default text read; subsequent reads/writes explicitly use UTF-8. No source/test bytes changed by this documentary correction.
