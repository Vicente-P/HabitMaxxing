---
title: 'HU-02 Login'
type: 'feature'
ticket: 'SCRUM-7'
created: '2026-10-06'
context:
  - 'docs/specs/auth/login.md'
  - 'docs/architecture/auth-flow.md'
  - 'docs/wiki/backlog.md'
---

**Authentication stage accepted locally — 2026-10-06.** The four approved decisions have deterministic proof and authorized real isolated PostgreSQL/Chrome acceptance on `a7bb421`. This is not production acceptance or security approval. Stage B habits remain unimplemented and original full CA-01 incomplete. [Execution evidence](../../odd/tasks/hu-02-login.md).

## Intent

The implemented HU-02 authentication stage follows the approved intent on the existing Auth.js Credentials flow: concurrent-safe five-failure lockout, recovery after 15 minutes, success reset, uniform accessible credential-failure feedback, verified persistent sessions, and server-bound dashboard protection. Apply the approved CA-03 privacy adjustment without substituting a second authentication stack. Stage acceptance explicitly defers actual habit availability to HU-06/authenticated readback; it does not complete the original full CA-01.

HU-01 is merged into develop and deployed. Its local acceptance established credential/session basics; production validation was read-only page availability, not functional registration or login. The original checkout remains on HU-01 `f407dc4`; implementation branch `codex/hu-02-login` started from integrated develop `1d8ea43`, without copying unrelated user configuration.

## References and authority

- [Login specification](../../docs/specs/auth/login.md): four acceptance criteria, 30-day sessions, account lockout, and Auth.js ownership.
- [Authentication architecture](../../docs/architecture/auth-flow.md): Credentials verification and server-bound authorization.
- [Backlog](../../docs/wiki/backlog.md): HU-02/SCRUM-7, HU-03 protection overlap, and HU-06 habit dependency.
- [HU-01 plan](plan-hu-01-account-registration.md): registration recovery invariants and prior evidence.
- [Contribution guide](../../docs/guides/contributing.md) and [testing guide](../../docs/guides/testing.md): feature work units and deterministic checks.

Backlog T-07/T-08/T-11 formerly described a custom login/JWT/refresh design, superseded in this reconciliation by the explicit Auth.js specification: use its existing handler, encrypted session cookie, and session lifecycle; do not add manually signed JWTs or a parallel refresh-token store. Specification REST status/body examples are not observed Auth.js transport guarantees: the previously observed credential error can have HTTP 200 and `ok: true` alongside `error: CredentialsSignin`.

## Implemented behavior and remaining proof

| Reusable evidence | Remaining HU-02 work |
|---|---|
| `loginSchema` trims/lowercases email and requires a nonempty password | Malformed cases covered deterministically; unknown/wrong/locked rejection observed in local A2 |
| Credentials provider selects safe fields and verifies bcrypt hashes | Implemented in login-policy; real isolated PostgreSQL A1 passed; production load unproven |
| Auth.js JWT strategy and user ID mapping exist | Explicit rolling 30-day configuration/callback proof; local real Chrome cookie/restart A2 passed; production Secure unproven |
| Login form handles pending/errors and requires `result?.ok && !result.error` | Uniform copy and semantic success guard proven deterministically; actual local safe session passed A2 |
| Prisma User already has `failedLoginAttempts` and `lockedUntil` | No schema migration is expected; verify deployed schema only within separately authorized acceptance |
| Dashboard now authenticates on the server before rendering its placeholder | HU-02 owns server-bound dashboard protection; saved-habit readback is not implemented |

## Boundaries & Constraints

**Implemented scope:** Credentials-provider policy, necessary small auth helper/test seams, login feedback, session configuration/proof, server-bound dashboard authentication guard redirecting unauthenticated visitors to `/login`, focused auth/form/boundary tests, and acceptance documentation. Guard implementation belongs to HU-02; local real browser acceptance passed A2.

**Out of scope:** registration redesign, password recovery, OAuth, HU-03 logout UX/session clearing/post-logout verification, habit CRUD/read-model implementation, a second token stack, schema/dependency upgrades, generated-client edits, production form tests, deployment, and unrelated user configuration changes. Global IP throttling/CAPTCHA is a separate abuse-control follow-up, not replaced by account lockout.

Do not log passwords, hashes, tokens, account-specific diagnostic errors, or environment values. Unknown-account, wrong-password, and infrastructure failure paths must expose no internals. Do not return lock counters in session/user payloads. Consider comparable password-verification work for absent accounts to reduce timing enumeration; test behavior without claiming constant-time network execution.

## Acceptance traceability

| Criterion | Required outcome | Proposed proof / dependency |
|---|---|---|
| CA-01 Stage A (approved staging) | Correct credentials establish a session and reach the protected dashboard; unauthenticated visitors are redirected to `/login` | Provider/session and server-bound guard tests plus approved browser login/access checks; local stage acceptance established by A1/A2 below |
| CA-01 Stage B (deferred, unimplemented) | The user's actual saved habits are available after login | HU-06/authenticated habit-readback dependency; record explicitly deferred and never mark the original full CA-01 complete from Stage A or placeholder content |
| CA-02 | Wrong credentials show exactly "Credenciales incorrectas", without identifying the failed field | Unknown/wrong-password/semantic-error form and provider tests under native Auth.js responses, not an exact HTTP 401 contract; uniform copy implemented and local acceptance passed |
| CA-03 (approved adjustment) | Five consecutive failures enforce a 15-minute internal lock; unknown, wrong-password, and locked-account failures all show "Credenciales incorrectas" | Deterministic threshold, active-lock, expiry, success-reset, concurrency, and indistinguishable external credential-failure tests; implemented with deterministic and real isolated local A1/A2 proof |
| CA-04 | Closing/reopening the app preserves successful login | Explicit 30-day configuration/cookie checks plus an approved browser profile restart; real Chrome process close/relaunch passed locally; no serialized cookie restoration |

## Approved decisions — 2026-10-06

**CA-03 privacy adjustment:** the human approved the same external credential failure for unknown email, wrong password, and locked accounts: "Credenciales incorrectas", consistent with CA-02. Preserve internal five-consecutive-failure / 15-minute lockout, expiry behavior, and success reset. Do not expose an account-specific lock message, code, or HTTP status that distinguishes these credential failures; never leak arbitrary provider errors through URLs. Implemented in L1/L2; real isolated local acceptance is recorded below.

**Native Auth.js transport:** the human approved the existing Credentials handler and `signIn` session flow without a second login endpoint or custom JWT/refresh stack. Specification HTTP 400/401 examples are illustrative, not an exact response contract; do not impose custom HTTP 400/401/429 responses on Auth.js. Preserve input validation and uniform credential-failure feedback. Judge client success using `result?.ok && !result.error` and independently verify an actual authenticated session; HTTP status or redirect alone is not proof.

**Dashboard guard ownership:** the human approved HU-02 ownership of server-bound dashboard access protection, redirecting unauthenticated visitors to `/login`. HU-03 reuses this single existing guard for logout and post-logout verification; it does not implement a duplicate guard. Authentication is enforced at the protected server boundary, not solely by client navigation or early proxy redirection. Implemented in L3; A2 separately proved local real browser access.

**Staged acceptance:** the human approved login and protected-dashboard acceptance now (CA-01 Stage A), with actual saved-habit availability explicitly deferred to HU-06/authenticated readback (Stage B). Stage A can be accepted only after its functional proof and an explicit dependency report. Stage B is unimplemented; the original full CA-01 remains incomplete until it is proven. This approves staging, not overall HU-02 completion.

The original specification/backlog lock copy, account-specific 429/`ACCOUNT_LOCKED` example, custom login/JWT/refresh tasks, HU-03 T-16 guard overlap, and unstaged CA-01 closure are superseded for this approved plan. Normative login specification, architecture and backlog are aligned in L4 documentary reconciliation; subsequent isolated local A1/A2 acceptance passed.

## Remaining authorization

No product decisions remain pending. Local implementation, branch synchronization, checks and work-unit commits were authorized and performed. Subsequently authorized isolated local DB/browser acceptance passed; no additional environment operations are implied. Production form tests and publication are not implied. Keep the approved Stage B dependency visible throughout implementation and closure.

## Implemented technical approach and limits

Use the existing User fields and one database-serialized authentication policy. Local generated Prisma declarations expose numeric `increment`, interactive `$transaction` with isolation level, and `Serializable`; PostgreSQL is the configured provider. These confirm API availability, not runtime race safety.

The policy uses a serializable transaction, an injected clock and up to three attempts, retrying only actual Prisma P2034 serialization conflicts. Avoid a detached read followed by a plain counter write. Atomically count an admitted wrong-password attempt; the fifth establishes `lockedUntil = now + 15 minutes`. Attempts during the active lock neither establish sessions nor extend the deadline. At `now >= lockedUntil`, clear the expired state and treat the request as a new sequence. Successful unlocked verification resets the counter and lock together. Do not throw away a committed failure increment by throwing inside its transaction.

Bcrypt verification inside the serialized decision can hold a database connection. A1 observed real conflicts/races and bounded recovery; production contention/performance and injected infrastructure/rollback failures are not established by that run. Success racing the fifth failure follows database ordering, so an active lock must not be bypassed by stale successful reads. Existing JWT sessions are not revoked by lockout.

The explicit 30-day session.maxAge derives native rolling JWT/cookie expiry; verify browser persistence and secure production cookie defaults using installed Auth.js behavior. Validate expiry with a deterministic clock where meaningful. Do not trust redirect success or HTTP `ok` alone as authentication proof. Preserve HU-01 account-created/manual-login recovery for thrown, non-ok, and semantic sign-in errors.

## Code Map and candidate surfaces

- `src/lib/auth.ts`: Credentials policy and session lifetime; use existing `src/lib/prisma.ts` singleton.
- `src/lib/validations.ts`: reuse existing login normalization; change only if contract proof requires it.
- `src/app/(auth)/login/page.tsx`: approved feedback/pending behavior; no password persistence client-side.
- `tests/validations.test.ts`, `src/lib/login-policy.test.ts` and `src/app/(dashboard)/dashboard/page.test.tsx`: existing regressions plus colocated policy/server-boundary proof; no tests moved.
- `src/app/(dashboard)/dashboard/page.tsx` / protected server boundaries: HU-02 server-side auth guard and unauthenticated `/login` redirect implemented in L3; HU-03 reuses it.
- `docs/specs/auth/login.md` and `docs/architecture/auth-flow.md`: reconcile approved transport/policy and observed evidence after implementation.
- `prisma/schema.prisma`: inspect existing fields only; no planned migration. `src/generated/prisma/` is never manually edited.

Execution used parent-bounded exact surfaces; this map does not expand write or environment authorization.

## Tasks & Acceptance

- [x] **L1 — Deterministic lock policy/reset implementation.** `779ca0b`: observed RED13 failures, focused29/full39 GREEN; actual isolated PostgreSQL proof subsequently passed A1. 418 gross lines including 196 initial plan/task lines; behavior/tests 222. Native high candidate explicitly declined; independent checks passed, not review approval.
- [x] **L2 — Deterministic feedback/session implementation.** `580929b`: RED4 failures, focused16/full42 GREEN, 84 gross lines. Uniform copy, native 30-day configuration and safe callback identity; local real session/restart subsequently passed A2. Native high candidate explicitly declined; independent checks passed, not review approval.
- [x] **L3 — Deterministic dashboard guard implementation.** `c4679b5`: RED7 failures, focused9/full51 GREEN, 82 gross lines. Server identity guard/redirect/error fail-closed; build dashboard dynamic. At L3 handoff parent assessed medium, review_due false under_budget, without approval or boundary advance; the later L3/L4 candidate was explicitly declined.
- [x] **L4 — Documentary reconciliation only.** Login specification, architecture, backlog and plan aligned with the four decisions; structural proof and local documentation commit. This checkbox does not close acceptance or publication.
- [x] **A1 — Real isolated DB acceptance:** two local runs passed persistence/expiry/reset/concurrent threshold and both success/fifth-failure orderings; six actual P2034 conflicts recovered with bounded retry.
- [x] **A2 — Real local Chrome acceptance:** anonymous/active safe session, uniform credential failures, persistent HttpOnly/SameSite=Lax cookie, actual process restart with same profile, protected access, keyboard and 320 px passed.
- [ ] **Stage B dependency:** actual saved habits via HU-06/authenticated readback; original full CA-01 incomplete.

## Verification and rollout

Planned runner: Vitest/Testing Library; use deterministic fake clocks and controlled interleavings. Prisma mocks can prove branches but not database atomicity: concurrency proof needs an explicitly authorized isolated PostgreSQL fixture, not production or ambient credentials. CI `passWithNoTests: true` means exit zero alone is insufficient; record discovered test names/counts.

After applicable source-mutating normalization, run focused auth/form tests, `pnpm test -- --run`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `git diff --check`. Build runs Prisma generation, not migrations; assert zero git-visible generated changes. Check cookie HttpOnly/Secure/SameSite, session identity/no-secret payload, empty fresh sessions, semantic credential failure, and browser persistence independently of HTTP success. Last code candidate L3 observed 51 tests and typecheck/lint/build/diff exit 0 after normalization, generated unchanged. L4 reuses that unchanged-source proof; structural checks only, no artificial RED or redundant build.

Baseline synchronization/branch creation and behavioral RED→GREEN checks were authorized and observed; exact evidence is in the execution task. Preserve unrelated original configuration. Parent owns native assessment/consent; no production acceptance or publication occurred. Local A1/A2 subsequently passed.

Original forecast: 350–600 authored lines. L1–L3 work units totaled 584 before L4. User approved a future stacked PR chain toward develop; publication and exact heads/count remain unset. One honest future partition: 196 initial intent/tracking lines can form a dependency-aware documentation slice, leaving L1 behavior/tests 222; L2 84 and L3 82 remain coherent units. Add actual L4 documentation scope before final slicing; do not compress content or reconstruct/publish branches here. Before isolated acceptance, the native L3/L4 range started at `580929b`; the user subsequently declined that exact candidate, without security approval.

Rollback removes the approved policy/UI/config work units without touching registration persistence or user records. Existing counters/locks may remain after code rollback: retain them rather than silently clearing accounts; any data repair requires separate authorization. Concurrent sessions already issued are not automatically revoked by account lockout; define and test that boundary rather than promising logout/global revocation. Cookie-lifetime rollback may not revoke preexisting cookies, so assess independently before release.

## Isolated acceptance evidence and limits

Two delegated runs on `a7bb421` exited 0: cached PostgreSQL 16 Docker fixture on loopback and local Next app, synthetic process-only environment, no remote credentials or source changes. A1 observed failures 1–5/900,000 ms lock, denial without extension, exact injected-clock expiry/reset, concurrent threshold, both real race orderings and six actual P2034 conflicts recovered; retry exhaustion was not observed. A2 closed the actual Chrome process and reopened its persistent profile with authentication intact, without storageState/cookie restoration.

Cookie expiry exceeded 29 days, HttpOnly and SameSite=Lax passed; HTTP-local Secure=false does not prove production Secure. No 30-day elapsed test or assistive-technology announcement test. Listeners/app/browser stopped and exact Docker fixture/volume removed; policy blocked removal of the owned temporary fixture/profile directory, retained locally without bypass. Detailed evidence: [task](../../odd/tasks/hu-02-login.md#isolated-local-acceptance--2026-10-06).

L4 commit `a7bb421` reconciled documents before acceptance; its L3/L4 native candidate was explicitly declined, not approved, as were L1/L2. Independent final unchanged-source proof: 51 tests and typecheck/lint/build/diff exit 0. This passive bookkeeping reuses that proof; publication and exact future PR count remain unset.

## Next step

Local authentication stage acceptance is recorded from the delegated A1/A2 run on exact `a7bb421`. Keep Stage B unimplemented and original full CA-01 incomplete. Parent reconciles this passive bookkeeping and task/mirror; L1/L2 and the L3/L4 candidate were explicitly declined, not approved; source behavior, publication and production operations are not expanded by this document.
