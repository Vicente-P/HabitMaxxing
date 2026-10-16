---
title: 'HU-01 Account Registration'
type: 'feature'
ticket: ''
created: '2026-10-05'
status: 'done'
baseline_revision: 'e89509569f17004ac594b493f0e6284f04d82c19'
route: 'full'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/docs/specs/auth/register.md'
  - '{project-root}/docs/architecture/auth-flow.md'
  - '{project-root}/_bmad-output/initiative-habitmaxxing-mvp/spec-hu-01-account-registration/registration-contract.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** HabitMaxxing has only placeholder registration and authentication surfaces, so a new user cannot create an account or establish a session.

**Approach:** Implement the approved HU-01 contract end to end: validated credential registration, secure password persistence, Auth.js Credentials verification, an accessible registration form that attempts sign-in after account creation, and a minimal working login fallback.

## Boundaries & Constraints

**Always:** Normalize email and name exactly as specified; enforce password limits before bcryptjs; hash with cost 12; return only safe user fields; preserve a successfully created account if automatic sign-in fails; provide accessible errors, pending behavior, and 320 CSS-pixel reflow; reuse the Prisma singleton and existing `User` model.

**Never:** Return or log credentials or password hashes; edit `src/generated/prisma/`; change the Prisma schema; add email verification, rate limiting, CAPTCHA, password-strength scoring, OAuth, password recovery, or login features beyond the minimal Credentials form; roll back account creation when post-registration sign-in fails.

**Decision:** Include a minimal working Credentials login form so the recovery link after failed automatic sign-in leads to a functional destination.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Valid registration | Trimmed optional name, mixed-case email, valid password | Create one user, return 201 with safe fields, attempt sign-in, redirect to dashboard on success | No error expected |
| Invalid payload | Missing/invalid email, oversized name, short or >72-byte UTF-8 password | Create nothing and return 400 | Show accessible field and summary feedback |
| Existing account | Normalized email already exists | Create nothing | API may return 409; UI shows the approved neutral message |
| Persistence failure | Unexpected database or hashing failure | Create no partial response and expose no internals | Return generic non-sensitive 500 feedback |
| Sign-in failure after creation | API returned 201 but Auth.js sign-in fails | Keep account and explain that creation succeeded | Do not retry or roll back; provide a login link |
| Manual login fallback | Existing user submits valid or invalid credentials at `/login` | Valid credentials establish a session and redirect to dashboard | Invalid credentials show neutral accessible feedback |

</frozen-after-approval>

## Code Map

- `src/lib/validations.ts` -- replace the placeholder with the shared registration schema and UTF-8 byte-length enforcement.
- `src/app/api/auth/register/route.ts` -- add the public registration Route Handler; reuse `src/lib/prisma.ts`, bcryptjs, and the shared schema.
- `src/lib/auth.ts` -- replace the placeholder with minimum Auth.js Credentials verification and safe session/JWT mapping; Credentials must not create users.
- `src/app/api/auth/[...nextauth]/route.ts` -- expose the Auth.js handlers from the shared configuration.
- `src/app/(auth)/register/page.tsx` and a colocated client component if needed -- replace the placeholder with the contract-driven form and post-201 sign-in flow.
- `src/app/(auth)/login/page.tsx` and a colocated client component if needed -- replace the placeholder with the approved minimal Credentials login fallback.
- `src/lib/prisma.ts` -- reuse unchanged unless a test seam is strictly necessary.
- `prisma/schema.prisma` -- existing `User` fields satisfy HU-01; do not modify.
- `vitest.config.mts` and new focused test files -- add meaningful validation, API, auth, and form coverage; the current configuration can pass with zero tests.

## Tasks & Acceptance

**Execution:**
- [x] Add failing validation and registration Route Handler tests covering normalization, UTF-8 password limits, safe responses, duplicate email, hashing, and generic failures.
- [x] Implement `src/lib/validations.ts` and `src/app/api/auth/register/route.ts` until the registration API tests pass.
- [x] Add failing Credentials-provider tests, then implement `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts` for credential verification and session creation.
- [x] Add failing form behavior tests, then implement the registration UI, accessible validation, pending state, API submission, post-creation sign-in, redirect, and recovery state.
- [x] Add failing login-form tests, then implement the minimal Credentials login fallback with accessible neutral errors and dashboard redirect.
- [x] Run the complete applicable verification suite and document any environment-only limitation.

**Acceptance Criteria:**
- Given a visitor provides valid unique credentials, when registration and automatic sign-in succeed, then the account is persisted securely and the user reaches the dashboard with an authenticated session.
- Given any invalid, duplicate, or unexpected failure state, when the visitor submits, then no sensitive information is exposed and the form presents the contractually required accessible feedback.
- Given account creation succeeds but automatic sign-in fails, when the flow completes, then the account remains valid and the visitor receives a clear path to login without automatic retry.
- Given an existing user follows the fallback to `/login`, when valid credentials are submitted, then an authenticated session is created and the user reaches the dashboard; invalid credentials disclose no account details.
- Given the form is used by keyboard or at a 320 CSS-pixel viewport, when validation and submission states change, then labels, focus, errors, and controls remain perceivable and operable.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Design Notes

Keep validation shared between API and UI without trusting the client. Treat the Route Handler as the only account-creation boundary, map known Prisma uniqueness errors deliberately, and keep unexpected failures generic. Auth.js Credentials reads the persisted hash only for authentication; registration remains independent so a failed sign-in cannot corrupt the completed write.

## Verification

**Commands:**
- `pnpm exec vitest run` -- expected: all focused and existing tests pass with non-zero app test discovery.
- `pnpm lint` -- expected: no lint errors.
- `pnpm typecheck` -- expected: no TypeScript errors.
- `pnpm build` -- expected: production build succeeds with required environment values available.

**Manual checks:**
- Verify keyboard-only operation, focus movement to feedback, duplicate-submit prevention, neutral duplicate messaging, sign-in-failure recovery, and 320 CSS-pixel reflow.

### Acceptance outcome — 2026-10-05

HU-01 acceptance completed locally against the explicitly authorized runtime database. Production deployment is not verified.

- Registration without a name reached the dashboard; isolated valid credentials established the expected session. Named registration returned only safe fields and accepted normalized email/name/password boundaries of 254 characters, 100 characters, and 72 UTF-8 bytes.
- Invalid/missing payloads and oversized values returned 400. Duplicate API/UI submissions returned neutral feedback; the original synthetic account remained one record. Both synthetic records contain matching bcrypt cost-12 hashes, not plaintext.
- The corrected login rejects HTTP-success credential errors with neutral feedback and no redirect; valid keyboard login reaches the dashboard. Commit `af1a9f5` preserves recovery and has 23 passing tests plus successful typecheck, lint, build, and diff check.
- Keyboard order, visible focus, invalid-submit email focus, pending disabled controls, restored submission, manual-login link, and visible register/login feedback were checked. Both pages fit 320 CSS pixels with `scrollWidth === innerWidth === 320`.
- Automatic-login failure recovery is covered by deterministic resolved-error/rejection tests, not live fault injection. Screen-reader announcement and zoom-specific behavior were not exercised; accessible live-region markup was inspected.
- Built-in logout encountered local-origin alias/CSRF feedback and remains an out-of-scope follow-up. Two synthetic accounts remain; no deletion or migration was performed.
- Native follow-up assessment against `2256a45`: medium, 223 changed lines, `under_budget`, review deferred—not a new security approval. PR/deployment require separate destination/session authorization.

Detailed task evidence: `../../odd/tasks/hu-01-acceptance-closure.md`.
