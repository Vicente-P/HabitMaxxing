# Registration Sign-in Recovery

## Objective and problem
Preserve the account-created/manual-login recovery message when registration succeeds but automatic sign-in rejects. The current shared catch incorrectly reports a generic registration failure after the account has already been created.

## Scope and authorized surfaces
- `src/app/(auth)/register/page.tsx`
- `tests/validations.test.ts`
- `odd/tasks/registration-signin-recovery.md`

Keep existing Spanish UI messages exactly as written. Technical documentation and new test descriptions use English.

## Constraints
- Baseline: `2256a45`, branch `feature/hu-01-account-registration`.
- Preserve unrelated edits; no remote operations, ambient credential discovery, dependency/version changes, or manual generated Prisma edits.
- One writer owns the bounded source and test change; parent owns review and any conventional commit.
- Parent must read back this document and establish its Engram mirror before source writes.
- Existing `pnpm build` may regenerate Prisma, but it must produce zero git-visible modifications under `src/generated/prisma`. Stop and report changes there without silently reverting them.
- Dependency audit is skipped: no audit script exists, and network operations are outside the authorized scope.

## Delivery and routing
- One coherent work unit, T1, keeps the fix and regression tests together.
- Route: delegated direct; trigger: two non-trivial source/test files and reading that prepares writing.
- Forecast: approximately 60 authored changed lines, excluding generated files.
- Delivery strategy: `ask-on-risk`; no push, PR, or merge authorized.
- RDD: on/global; committed-only assessment against `2256a45` returned medium, `review_due: false`, reason `under_budget`. Review is deferred within the accumulated slice, not approved.
- Work-unit commit: `76919d4` — `fix(auth): preserve account-created recovery on sign-in rejection`. No AI attribution.
- Rollback boundary: the registration recovery behavior and its tests in the two source/test files above.

## Task checklist
- [x] **T1: Distinguish automatic sign-in failure from registration failure.**
  - Implementation, all required functional checks, work-unit commit, and native due assessment completed. No new native review is due for this under-budget medium slice.
  - Add a rejected-signIn regression that verifies the exact existing recovery message, manual-login link, restored submit availability, and one registration request.
  - Add a registration-request failure guard if existing coverage is absent; verify generic failure and no sign-in attempt.
  - Observe deterministic RED before implementation.
  - Apply the minimal recovery fix without changing generic registration failures or existing successful-login behavior.
  - Observe GREEN and run all required checks.
  - Record observed check results, failed/skipped/pending checks, authored line count, assessment outcome, and conditional commit identity.

## Acceptance criteria
- Successful registration followed by rejected automatic sign-in displays `Tu cuenta fue creada, pero no pudimos iniciar sesión. Inicia sesión para continuar.`
- Existing resolved non-ok sign-in recovery remains unchanged.
- Registration-request failure remains generic and never claims account creation.
- Manual login remains available at `/login`; pending state is restored; no second registration request occurs.
- No unrelated source, dependency, or generated-client changes.

## Required verification
- Focused deterministic RED/GREEN: `pnpm exec vitest run tests/validations.test.ts`.
- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `git diff --check`
- Inspect `git status --short -- src/generated/prisma` after build; any git-visible generated changes require stopping and reporting.

## Progress and evidence
- Read-only preparation verified clean baseline and current CodeGraph index.
- Baseline recovery test covered resolved non-ok sign-in only; rejected sign-in coverage is now added.
- Baseline had no registration-request exception guard; the focused test file now verifies generic failure with no sign-in attempt.
- RED: focused Vitest exited 1, 1 rejected-signIn regression failed and 9 tests passed; expected account-created message, received generic error. GREEN: same command exited 0, 10/10 tests passed.
- Required checks: `pnpm test -- --run` exited 0 (20/20 tests, 2 files); `pnpm typecheck` exited 0; `pnpm lint` exited 0; `pnpm build` exited 0; `git diff --check` exited 0.
- Normalization: targeted ESLint --fix passed before GREEN; initial literal parenthesized path invocation failed in Windows pnpm.cmd parsing (255), then narrow register-page glob succeeded. No unrelated normalization.
- Build generated Prisma Client v7.8.0; subsequent git status under `src/generated/prisma` returned no changes.
- Vitest emitted its existing vite-tsconfig-paths recommendation; no dependency/configuration change was made.
- Audit skipped as scoped: no script and no network authorization.
- Source/test diff: 32 insertions and 1 deletion (33 authored changed lines). Work-unit commit including the task document: 104 insertions and 1 deletion (105 authored changed lines across 3 files).
- Native committed-only assessment against `2256a45`: medium risk, `executable_change` in the registration page, 3 changed paths, 105 changed lines, `review_due: false`, reason `under_budget`. No transaction started; review is deferred, not an approval or security verdict.
- Commit identity: `76919d4`. Readback confirms committed source/test changes match the verified implementation; the commit hook introduced no additional changes. Generated Prisma remains git-visible clean.
- Engram mirror: initial document reconciled by parent with observation #2236 before source writes; completion evidence awaits parent mirror refresh.

## Next step
No implementation remains. Parent refreshes the Engram mirror and records this documentation-only completion update. Future accumulated medium-risk slice changes may require native review once the budget is reached; no push, PR, or merge is authorized.
