# HU-03 / SCRUM-8 — Native logout

## Objective and authorization

Protect shared-device use by letting an authenticated user leave this browser session and return to `/login`, then deny fresh protected dashboard access.
The owner authorized native Auth.js local implementation, tests and Conventional work-unit commits on 2026-10-07. Parent readback is complete; stacked integration delivery toward `develop` is approved. L1/L2 local deterministic implementation is complete and independently verified; isolated logout/dashboard acceptance is now observed; remote publication remains unauthorized.
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
- Initial implementation excluded runtime acceptance; the owner later authorized isolated local A1 only. No remotes, publication, deployment, production/account tests, environment reads/copies, new dependencies, schema/migrations or generated-file edits.
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

- [x] **G1 — Bootstrap/handoff (local only).** Branch/task, parent readback and stacked delivery decision completed. Route delegated: preparation for coordinated multi-file implementation. Full Engram mirror remains pending; local completion does not claim memory synchronization.
- [x] **L1 — Native logout behavior and tests.** Delegated writer: client behavior plus colocated tests are two nontrivial logic files. Observe meaningful Vitest RED for native invocation, pending/duplicate and PM-03 retry feedback; implement GREEN/refactor without custom cookie logic.
- [x] **L2 — Dashboard integration and contract alignment (deterministic implementation).** Delegated writer: server page/test plus three normative docs. RED for changed authenticated output; preserve anonymous/error guard cases, reconcile approved semantics and stale transport notes without claiming acceptance.
- [x] **A1 — Isolated real acceptance (local stage only).** Owner-authorized delegated verification observed cookie removal/session null, fresh/direct/Back dashboard denial, repeated/no-session behavior, keyboard, pending duplicates, neutral failure/retry and 320 px across three bounded attempts on `201ce13` (source `689cbb8`).
- [x] **L3 — Evidence-based staged closure (local only).** Delegated documentary reconciliation records observed logout/dashboard acceptance; HU-06 habits dependency and original full-story incompleteness remain explicit. Delivery and memory mirror remain pending.

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
Mocked calls alone do not certify cookies, CSRF, browser caching or session/access denial. Deterministic results below are supplemented by the later owner-authorized isolated A1 evidence; no production or security approval follows.

## Delivery, rollback and next gate

Delivery strategy: `ask-on-risk`; chain strategy `stacked-to-main` with integration target `develop` (owner-approved 2026-10-07), no inherited HU-02 topology or PR count. Forecast includes 209 existing plan/review lines, this task, about 180–300 behavior/test changed lines and 40–90 normative-doc changed lines: approximately 500–700 gross authored lines. Count actual net additions plus deletions at each work unit; never omit proof or compress to meet budget.
Parent resolved the delivery choice before the first commit: stacked integration PRs toward `develop`; exact coherent slices will follow observed counts. Publication is not authorized by that planning choice. Keep complete behavior and tests in a cohesive slice; evidence/contract dependencies must remain honest and independently checkable.
Rollback future approved work-unit commits only: remove logout control/integration/tests and restore their approved documentation boundaries; preserve the existing server guard/login policy and do not delete accounts or session data.
Bootstrap commit: `33740e0c19bcae4d991ff50697a2ec06d3d460fb` (three planning documents, 280 additions); structural checks passed and hook changed no source. L1 tested the standalone control; L2 integrated it after the existing dashboard guard. Local deterministic implementation is complete; later isolated A1 acceptance is recorded below.
**Memory status:** full Engram mirror pending because authoritative runtime binding is unavailable; no memory mutation or remembered session identity is used. G1 records local completion only; parent explicitly acknowledged the blocked mirror and authorized safe local L1 continuation.

## L1 evidence and handoff

Installed `signOut` parses JSON without checking HTTP success; installed `getSession` returns null after transport errors. The control therefore uses native nonredirecting signout, then an explicit same-origin, no-store session GET with redirects rejected. Only successful nonredirected JSON `null` permits `/login` navigation; active/malformed/failed reads show neutral Spanish retry feedback. No manual cookie or CSRF logic.
Observed RED: 11 failed tests on the runnable inert button; 10 behavioral assertion failures (missing navigation/feedback/pending) plus one unmount fixture callback unavailable because no handler ran. GREEN: focused 11/11; full 62/62 (baseline 51 retained). First typecheck failed with two TS2352 mock casts; explicit `unknown` bridge corrected only test typing, then normalization and all final checks passed.
Final foreground results: focused `pnpm exec vitest run "src/app/(dashboard)/dashboard/logout-button.test.tsx"` 0; `pnpm test -- --run` 0; `pnpm typecheck` 0; `pnpm lint` 0; `pnpm build` 0; `git diff --check` 0. Build generated Prisma with zero git-visible changes; dashboard remains dynamic and unchanged.
L1 rollback boundary: remove the two standalone control/test files and their task/plan evidence, preserving existing dashboard/authentication. L1 local commit: `953cf4ca730d316134a4d36e542e4a535959eb1e` (195 gross lines; 140 standalone source/test additions); native assessment/consent parent-owned against bootstrap `33740e0`, no review approval claimed.
Tests mock native invocation/session responses, including null, remaining session, HTTP failure, redirect, malformed/missing/invalid JSON, rejection, pending duplicates, retry and unmount. They are not cookie/CSRF/browser/runtime proof. At L1 handoff A1 was unauthorized and unchecked; later local-stage acceptance is recorded below, not full-story completion. Mirror remains pending.
Encoding readback corrected bootstrap task/plan mojibake introduced by the Windows locale-default text read; subsequent reads/writes explicitly use UTF-8. No source/test bytes changed by this documentary correction.

## L2 evidence and handoff

Historical parent assessment of `33740e0..4c72c544`: RDD on/global, medium 195 gross, `review_due=false` / `under_budget`; L1 remained pending against `33740e0`, without approval. Final `33740e0..689cbb8` assessment: high, 267 gross; owner explicitly declined exact native target `465e1a`, validated as candidate-scoped decline. Mode remains on/global; intentional unreviewed boundary is `689cbb8`, with no security approval or reusable authority for future candidates. Mirror remains unavailable.
Observed RED: focused page/control/validation runner exited 1 with one missing authenticated logout-button assertion, 35 passed; all existing guard cases retained. GREEN: 36/36 focused; full 62/62. Existing nine page cases now also verify the client boundary is rendered only after server authentication and absent on denied/error paths.
Final foreground `pnpm test -- --run`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `git diff --check`: all exit 0 after allowed page/test ESLint normalization. Prisma generated with no git-visible changes; dashboard remains dynamic. At L2 handoff there was no runtime/DB/browser proof; later isolated A1 is recorded below. No dependency upgrade; Prisma update notice was informational only.
Logout spec, architecture and backlog now document native CSRF/form/JSON ownership, checked native session read, PM-01 browser-only boundary, PM-02 deferred habits/full-story incompleteness and PM-03 neutral retry. Existing original CA text remains traceable; acceptance boxes were unchecked at the L2 handoff and are reconciled below after isolated proof. PM review evidence remains historical against its stated baseline.
L2 rollback: remove dashboard control import/render and related assertions, restore this unit's three normative-document changes and plan/task evidence; preserve HU-02 guard and L1 tested standalone control. L2 local commit: `689cbb8adf9cc015fd46f1a53ac7657fd05d5a5a` (80 gross lines). Independent verification of those exact bytes: focused 36/36, full 62/62, typecheck/lint/build and worktree/committed diff checks all exit 0; 10 local references and fences valid, source/generated clean, no functional discrepancy. Earlier corrected failures remain historical, not current failures; mocked proof is not runtime or security approval.
Next: prepare the already selected stacked delivery locally; publication requires separate authorization. A1 and L3 now close the proved local logout/dashboard stage only. Stage B habits/API proof is deferred to HU-06 and full original HU-03 remains incomplete. No source edits outside approved surfaces, no publication or production operations.

## Isolated A1 acceptance and L3 closure — 2026-10-07

Proof candidate: `201ce13b135e4de54b6195b91f3b21d10a791224`, source unchanged from `689cbb8`; three owner-authorized disposable local DB/browser attempts, no production or remote account testing.
Attempts 1/2 observed real login/logout, session HTTP 200 JSON `null`, removed `authjs.session-token`, fresh/direct/Back dashboard HTTP 307 to login and 320 px without overflow. Attempt 1 stopped at a combined repeat assertion with individual values unknown. Attempt 2 established repeated/no-session native POST 200, no classified callback error, null session/absent cookie/protected denial; callback was not same-origin and not the expected login path, explaining the strict harness mismatch, with origin cause unknown. Keyboard Enter and held-confirmation pending/one-POST duplicate prevention passed; its broad alert locator matched the Next.js announcer before exact retry proof.
Attempt 3 focused recovery harness exited 0: one injected session-confirmation HTTP 503 showed exactly "No pudimos confirmar el cierre de sesión. Inténtalo de nuevo.", restored retry and stayed on dashboard without false success navigation. Pending disabled duplicate invocation with one POST; after removing injection, keyboard Space retry reached login with real session 200/null, absent cookie and dashboard 307/login. The combined evidence passes the approved local stage; earlier harness assertions did not establish source defects.
Local HTTP cookie metadata: HttpOnly, SameSite=Lax and persistent; Secure=false expected locally, not production Secure proof. Copied-JWT/device revocation and habits API remain excluded; full original HU-03 stays incomplete. Native candidate decline/mode and lack of security approval are unchanged.
Owned containers/volumes were removed; browsers/apps stopped and listeners absent. Policy blocked temporary-directory cleanup in all three attempts; retained local fixture/profile cleanup is a follow-up, not an acceptance blocker. No cleanup bypass or inspection of retained contents; unrelated HU-02 fixture remains untouched.
L3 is passive documentation only: reuse exact-source 36 focused/62 full tests and all checks exit 0; structural readback, local references/fences/whitespace and diff checks apply now. Local closure commit identity is handed to parent, not self-recorded; remote delivery and Engram mirror remain pending.
