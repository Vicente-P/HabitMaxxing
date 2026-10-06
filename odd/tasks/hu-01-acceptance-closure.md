# HU-01 Acceptance and Documentary Closure

## Objective
Validate the implemented registration and minimal login fallback against the approved HU-01 acceptance contract, then reconcile durable documentation with observed evidence. Never equate mocked tests, a successful build, or deferred native review with live acceptance.

## Baseline and routing
- Baseline: `690eead`, branch `feature/hu-01-account-registration`.
- Route: delegated direct; triggers: coordinated acceptance evidence and multiple non-trivial documentation surfaces.
- Three coherent tasks: A0 authentication guard correction; A1 acceptance evidence; A2 documentary closure.
- Forecast: approximately 100 authored code/test and documentation-update lines, with the existing task document contributing to the accumulated total; delivery strategy `ask-on-risk`.
- RDD on/global; native assessment/review and conventional commits remain parent-owned.
- Previous follow-up: `76919d4`, functional checks passed, medium risk under budget; this is not a new security approval.

## Authorized edit surfaces
- `odd/tasks/hu-01-acceptance-closure.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `tests/validations.test.ts`
- `_bmad-output/initiative-habitmaxxing-mvp/plan-hu-01-account-registration.md`
- `docs/specs/auth/register.md`
- `docs/architecture/auth-flow.md`
- `_bmad-output/initiative-habitmaxxing-mvp/spec-hu-01-account-registration/registration-contract.md`

Task document and test descriptions are English. Preserve existing Spanish UI messages exactly; extend existing Spanish documents using neutral professional Spanish. User explicitly authorized only the bounded authentication success-guard correction and regression tests. No further source/test scope is authorized. Preserve frozen intent and unrelated concurrent edits.

## Authorization and constraints
- Exact `.env` inspection was authorized. Never print or persist raw environment contents, connection URLs, passwords, tokens, usernames, or credentials.
- Remote scope: use only the runtime database destination and credentials supplied by `DATABASE_URL` in the exact authorized `.env` file, solely for test-account creation and registration/login validation initiated from localhost.
- Do not use `DIRECT_URL`, other remote destinations, ambient credentials, or authenticated sessions.
- Set `AUTH_URL` only in the local application process to the selected loopback origin. No persisted environment changes.
- Test-account creation is an authorized persistent side effect; do not delete accounts or send email. Record only safe synthetic test identifiers and outcomes.
- No migrations, schema changes, dependency/version changes, manual generated Prisma edits, or environment-file edits.
- Bind the acceptance server to loopback, proposed `127.0.0.1:3001`; verify port availability before starting. Do not replace an existing listener.
- Parent reads back and mirrors this task document before execution or other writes.
- PR/deployment remain pending explicit destination, operation, and credential/session authorization. Do not publish, merge, deploy, or probe remote hosting services now.

## Task checklist
- [x] **A0: Correct authentication success guards and regressions.**
  - Parent reads back and mirrors this amended task document before source writes.
  - Add deterministic login and registration regressions for `ok: true` with `error: CredentialsSignin`; observe RED before implementation.
  - Require `result?.ok && !result.error` in both forms; preserve neutral login feedback and account-created recovery for rejected promises and resolved non-ok results.
  - Observe GREEN, normalize only the authorized files before final checks, then run the full required suite, typecheck, lint, build, and diff check.
  - Confirm build generation produces zero git-visible Prisma changes; stop and report any changes without silent reverts.
  - Record exact results and commit identity; parent owns the conventional work-unit commit and post-commit committed-only assessment against `2256a45`, retaining the prior under-budget slice. No review approval is presumed.
- [x] **A1: Observe registration and login acceptance.**
  - Reconcile existing proof and document deterministic coverage gaps without silently adding source/test changes.
  - Check loopback port availability and start the existing local development server with the process-local AUTH_URL override.
  - Create a unique synthetic test account through the local registration UI; verify successful response contains safe fields, authenticated session establishment, and dashboard navigation.
  - Verify optional name behavior, normalized email, invalid/missing input, short and oversized UTF-8 password feedback, and contract boundary handling using proportionate local checks.
  - Verify duplicate registration is neutral and creates no second account.
  - Verify manual login succeeds for the test account and invalid credentials show neutral accessible feedback.
  - Verify keyboard order, visible focus, validation focus movement, accessible status/errors, duplicate-submit prevention, and 320 CSS-pixel reflow.
  - Reuse rejected-signIn regression for deterministic failure recovery where safe browser fault injection is unavailable; clearly distinguish mocked recovery proof from live persistence proof.
  - Record side effects and every passed, failed, unavailable, or pending check. Do not mark acceptance complete without required observed evidence.
- [x] **A2: Reconcile documentation after observed acceptance.**
  - Documentary edits and structural checks completed in `466d429`; candidate review was explicitly declined.
  - Update plan Verification with concise acceptance evidence and limitations; preserve frozen intent.
  - Reconcile the registration-spec test checklist only for checks actually demonstrated.
  - Correct stale planned-only authentication caveats in architecture and contract; distinguish implementation from deployment.
  - Update task status, evidence, line count, parent-owned native assessment/commit identity, and Engram mirror.
  - Run documentation structural checks and leave PR/deployment pending authorization.

## Acceptance and verification
Required acceptance source: plan acceptance criteria and manual checks; registration contract and API/UI spec. Full closure requires real registration persistence, successful authenticated dashboard navigation, functional manual-login fallback, truthful recovery, and accessible keyboard/reflow behavior.

Exact commands, executed only after parent mirror and follow-up authorization:
- Port check: `Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue`.
- Local server, with process-local AUTH_URL set to the loopback origin and authorized DATABASE_URL retained: `pnpm exec next dev --hostname 127.0.0.1 --port 3001`.
- Existing deterministic proof: `pnpm exec vitest run tests/register-route.test.ts tests/validations.test.ts`.
- A0 RED/GREEN: `pnpm exec vitest run tests/validations.test.ts`.
- A0 full required suite: `pnpm test -- --run`.
- `pnpm typecheck`
- `pnpm lint`
- A0 production build: `pnpm build`.
- `git diff --check`
- `git status --short -- src/generated/prisma`

A0 is a behavior correction and requires the listed production build. No build or Prisma CLI command is required for subsequent documentary-only closure. Existing build generation is allowed but manual generated edits, migrations, network audit, and installers remain forbidden. Stop for separately approved scope if further executable changes are needed.

## Progress and evidence
- Existing functional evidence: 20 tests passed, typecheck/lint/build/diff-check passed for the recovery follow-up; generated Prisma clean.
- A1 partial: parent created the unique synthetic account through the registration UI without a name; pending state disabled the button and successful registration navigated to the dashboard.
- Isolated local Auth.js flows used separate fresh cookie jars. Valid credentials established the synthetic user session. Invalid credentials returned HTTP 200, client `ok: true`, `error: CredentialsSignin`, and no session user.
- Initial acceptance found a confirmed UI success-guard defect: both forms treated `result.ok` alone as successful authentication. A0 corrected it; an existing session did not cause the defect.
- A0 implementation and functional checks passed: both forms now require `result?.ok && !result.error`. Registration resolved-error coverage includes HTTP ok false and true; login resolved-error coverage includes both, while existing rejected-promise recovery remains green.
- A0 RED: `pnpm exec vitest run tests/validations.test.ts` exited 1, with both HTTP-ok/semantic-error regressions failing and 11 tests passing. GREEN: same command exited 0, 13/13 tests passed after the minimal guards and targeted ESLint normalization.
- A0 final checks: `pnpm test -- --run` exited 0 (23/23 tests, 2 files); `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `git diff --check` exited 0. Prisma generation ran as part of the existing build; generated Prisma status returned no git-visible changes. No migration, dependency/environment change, or server restart occurred.
- A0 committed as `af1a9f5`, `fix(auth): reject semantic sign-in errors`. Parent spot check passed. Native committed-only assessment against `2256a45`: medium risk, 223 accumulated changed lines, `review_due: false`, `under_budget`; review deferred, not approved. Committed source/test readback matches the verified implementation, with no hook changes.
- Initial local server: loopback port 3001 had no listener; existing Next.js development server started at the process-local AUTH_URL origin. Parent owned the initial browser submission; no environment file modified.
- Initial development session was stopped with Ctrl+C after the confirmed blocker; port 3001 was free before the resumed server launched.
- A1 deterministic checks: focused existing suite passed 20/20 tests (2 files); typecheck, lint, and diff-check exited 0. Generated Prisma has no git-visible changes. No build, migration, or network audit ran.
- The initial 20 passing tests and typecheck/lint/diff-check did not prove the actual Auth.js HTTP-success/error semantics; those earlier mocks omitted the subsequently added A0 case.
- Resumed A1: owned loopback server ready with process-local AUTH_URL override; parent coordinates UI acceptance. No environment file change.
- Local API checks: invalid email, empty object, missing email/password, null body, malformed JSON, short password, more than 72 UTF-8 bytes, name over 100 characters, and email over 254 characters all returned 400 `VALIDATION_ERROR`.
- Existing synthetic duplicate with mixed-case/trimmed email returned 409 and the exact neutral conflict message. No second original-account record was created.
- One additional named boundary account returned 201 with only `createdAt,email,id,name,updatedAt`; normalized email length 254, trimmed name length 100, and password length 72 bytes were accepted.
- Read-only runtime DATABASE_URL verification selected only the two synthetic emails: each count 1; original name null; named name length 100; both passwords were not plaintext, matched their synthetic inputs, and used bcrypt cost 12. No hash or connection credentials were logged.
- Post-fix isolated fresh-cookie auth routes: invalid password returned HTTP 200 with `CredentialsSignin` and no user session; valid credentials returned no error and the original synthetic user session.
- Parent UI acceptance: invalid password stays on login with neutral feedback and restored submit; valid keyboard login reaches dashboard. Register invalid empty submit focuses email; tab order email/name/password/submit and visible focus ring checked. Register/login controls and feedback fit 320 pixels with scroll width equal to viewport width. Duplicate double-click disables pending submit, restores it with neutral feedback, and leaves the original DB count at one. Manual login link works.
- A1 completed with explicit proof limits: failure recovery is deterministic, not live fault injection; screen-reader and zoom-specific behavior not exercised. Local built-in logout produced origin-alias MissingCSRF feedback and is an out-of-scope follow-up.
- A2 reconciled plan status to supported `done` (BMad ticket status convention), acceptance evidence, all eight API checklist items, and stale planned-only architecture/contract caveats; production deployment remains unverified. Whitespace-only name behavior has schema-inspection evidence, not a separately created account.
- Structural closure checks: `git diff --check` passed; frozen plan intent matches HEAD; five documentary surfaces only, 54 additions and 24 deletions (78 authored lines before this final progress note). Development session was already unavailable when stop was requested; port 3001 was verified clear, with no other process stopped.
- Persistent test accounts: original `hu01-acceptance-20261006-0205@example.com` plus one writer-created named boundary account. Boundary email construction: `hu01-acceptance-max-20261006-` padded with `x` to 64 local-part characters, domain labels of 63 `a`, 63 `b`, 56 `c`, and `test` characters (254 total). Exactly one additional account created; none deleted.
- A2 committed as `466d429`, `docs(auth): close HU-01 acceptance`. Accumulated assessment against `2256a45`: high risk (authentication documentation), 278 lines, review due. User explicitly declined this candidate; native returned `declined_this_candidate` for target `sha256:6365a38ad1de54e06cd3c7ab57bafde174fefb88b3439e69568965c7fc4690e2`. No new review approval; future reviews remain enabled.
- Engram mirror: initial document reconciled with parent observation #2253 before A1 execution; progress update awaits parent refresh.

## Next step
All three tasks are complete. Parent refreshes the mirror and clarifies PR/deployment destination/session authorization. No implementation or HU-01 acceptance check remains beyond the explicitly recorded non-exercised caveats and out-of-scope logout follow-up. Acceptance server is no longer listening; do not publish or deploy automatically.
