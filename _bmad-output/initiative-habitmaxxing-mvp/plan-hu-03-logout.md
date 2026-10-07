---
title: 'HU-03 Logout'
type: 'feature'
ticket: 'SCRUM-8'
created: '2026-10-06'
context:
  - 'docs/specs/auth/logout.md'
  - 'docs/architecture/auth-flow.md'
  - 'docs/wiki/backlog.md'
---

**Local implementation authorized (2026-10-07).** PM-01–PM-03 and the native Auth.js approach are owner-approved; tests and local work-unit commits on a new branch are authorized. Runtime acceptance, remote operations and publication remain unauthorized. No acceptance criterion is passed; L1 control and L2 dashboard integration have deterministic proof only; bootstrap readback/delivery choice are complete; Engram mirror remains unavailable and explicitly pending.

## Intent

Let an authenticated user choose "Cerrar sesión", leave the current browser session and return to `/login`; subsequent protected dashboard access must redirect to login. This protects shared-device use without introducing a second authentication stack or duplicating the HU-02 server guard. PM-02 permits future logout/dashboard stage acceptance only after proof; habits API acceptance stays deferred to HU-06 and the original full story remains incomplete.

## References and current evidence

- [Logout specification](../../docs/specs/auth/logout.md): HU-03/SCRUM-8 criteria and native Auth.js intent.
- [Backlog](../../docs/wiki/backlog.md#-hu-03--cierre-de-sesión-scrum-8): one-point, high-priority Sprint 1 story; its custom endpoint task needs reconciliation.
- [Authentication architecture](../../docs/architecture/auth-flow.md): existing authentication ownership.
- [HU-02 plan](plan-hu-02-login.md): accepted local authentication stage, deferred actual habits and proof limits; historical execution statements are not current publication status.
- Current integration baseline: `d3f3c3df668096fc6f97980defdae0f326a7a24c`, tree `1fbd672fea23c8cc24e35d84c64ec071f496e1da`. HU-02 was integrated and deployed; production proof covered page GETs and anonymous dashboard redirect only, not functional login/cookies.
- `src/lib/auth.ts` already exports `signOut`, `auth` and handlers; the existing catch-all route exposes GET/POST. Dashboard already authenticates on the server but has no logout control. No application logout invocation or logout-specific tests were found.
- Installed `next-auth/react` obtains CSRF, sends form-encoded signout parameters, reads JSON and then redirects. Specification claims of no body/no interceptable JSON are stale; use the installed API rather than implementing those claims literally.

CodeGraph was checked before focused inspection; it reported pending index changes and no lexical logout match. Focused source/package readback supplied the missing evidence without index mutation.

## Acceptance traceability

| Criterion | Planned proof | Boundary |
|---|---|---|
| CA-01: choose logout, invalidate session and reach login | Deterministic control/pending/failure tests plus separately authorized isolated browser logout, cookie removal and `/api/auth/session` null | PM-01 owner-approved 2026-10-07: current browser session removal only; no copied-token or all-device revocation; implementation/proof pending |
| CA-02: protected access after logout redirects to login | Reuse existing server dashboard guard; isolated fresh request, direct navigation and browser-back verification after logout | PM-02 owner-approved 2026-10-07: future logout/dashboard stage acceptance requires proof; habits API deferred to HU-06, unchecked; original full story incomplete |

## Scope and decision status

1. **Native transport — owner-approved 2026-10-07:** use `signOut` from installed `next-auth/react`, targeting `/login` with supported `redirectTo`; no custom `/api/auth/logout`, token implementation or manual cookie deletion. Reconcile backlog/spec transport notes only during authorized implementation.
2. **Session meaning — PM-01 owner-approved 2026-10-07:** CA-01 removes the current browser's Auth.js session cookie. Do not promise revocation of copied JWTs, other devices or every concurrent session. This resolves intent only; implementation and runtime proof remain pending. Stronger revocation is outside the approved boundary.
3. **Dependent API acceptance — PM-02 owner-approved 2026-10-07:** Defer `/api/habits` postlogout 401 proof until HU-06/authenticated readback exists. Future logout/dashboard stage acceptance requires observed proof; keep habits unchecked and do not claim original full-story completion.
4. **Failure outcome — PM-03 owner-approved 2026-10-07:** If logout cannot be confirmed, show a neutral non-success notice and re-enable the logout button for retry. Arrival or redirect to `/login` alone does not prove the session ended. Finalize exact neutral Spanish copy during authorized implementation; pending/duplicate and repeated/no-session behavior remain implementation proposals.

Authorized local implementation scope: logout control, focused deterministic tests, native session removal/redirect, existing guard reuse, documentary reconciliation and separately authorized isolated acceptance. Do not duplicate middleware/proxy authentication.

Out of scope: login policy changes, habit creation/readback, HU-04 recovery, all-device/token revocation, account deletion, new schema/migrations, dependencies, production account tests, secret/environment changes, deployment and release operations.

## Proposed implementation surfaces

These paths are the authorized later implementation surfaces; this bootstrap writes only the plan, review and ODD task. Parent authorizes each bounded source phase after readback and the delivery decision.

| Path | Proposed responsibility |
|---|---|
| `src/app/(dashboard)/dashboard/logout-button.tsx` | Small client interaction boundary using native signout; no session or password props |
| `src/app/(dashboard)/dashboard/logout-button.test.tsx` | Colocated Testing Library interaction, pending/failure/duplicate and native API-call proof |
| `src/app/(dashboard)/dashboard/page.tsx` | Render control only after existing server authentication; preserve placeholder and guard |
| `src/app/(dashboard)/dashboard/page.test.tsx` | Extend existing authenticated rendering assertions without weakening anonymous/error cases |
| `docs/specs/auth/logout.md` | Actual transport/session scope, criteria and honest acceptance evidence |
| `docs/architecture/auth-flow.md` | Native logout and guard reuse flow |
| `docs/wiki/backlog.md` | Reconcile T-13/T-14/T-16 and approved dependency boundary |
| This plan and future `odd/tasks/hu-03-logout.md` | Approved intent and bounded execution evidence, only after implementation authorization |

Existing `src/lib/auth.ts` and catch-all handler are reused; no planned change to provider/session policy. No browser fixture or test configuration file is pre-authorized by this map. Stop and derive additional exact surfaces if necessary.

## Planned task sequence

- [ ] **G1 — Resolve intent and authorize execution.** PM-01–PM-03 and native Auth.js local implementation are approved. Branch `codex/hu-03-logout` was created at pinned integration `d3f3c3d` without fetching; current origin freshness is not asserted. The ODD task and parent readback are complete; stacked integration delivery toward `develop` is approved. G1 records local completion only; the unavailable Engram mirror remains pending.
- [x] **L1 — Logout control with behavior tests.** Observe meaningful RED for authenticated control/native invocation, disabled pending/duplicate prevention and the approved PM-03 neutral non-success notice and re-enabled retry on unconfirmed logout; implement GREEN and refactor. Keep tests with the behavior, preserve HU-01/HU-02 regressions and avoid copying native CSRF/cookie logic.
- [x] **L2 — Guard integration and documentation (deterministic implementation).** Observe RED for changed authenticated page output, preserve all current redirect/fail-closed cases, then render the control. Reconcile only approved contract changes; pending acceptance stays unchecked. Close coherent tested units with future Conventional Commits after checks.
- [ ] **A1 — Real isolated acceptance, separate permission required.** Use an explicitly authorized disposable local DB/account/browser, login, logout, inspect session/cookie outcome, verify direct/back protected access, repeated/no-session logout, keyboard and 320 px. Do not reuse production credentials or retained earlier fixture/profile contents.
- [ ] **L3 — Evidence-based closure.** Record logout/dashboard stage acceptance only after observed proof; keep habits API unchecked under HU-06 and original full-story completion incomplete. No acceptance claim from mocks alone; no production/security approval inferred from local acceptance or deployment status.

## Verification and review handoff

Planning uses structural checks only; no meaningful behavioral RED or expensive source suite applies to this passive document. Future deterministic runner is existing Vitest/Testing Library, not a new framework. Use controlled deferred promises for pending behavior and a redirect stub matching existing dashboard tests; record actual failed assertions/counts before production edits.

Proposed future focused commands:

```text
pnpm exec vitest run "src/app/(dashboard)/dashboard/logout-button.test.tsx" "src/app/(dashboard)/dashboard/page.test.tsx" tests/validations.test.ts
pnpm test -- --run
pnpm typecheck
pnpm lint
pnpm build
git diff --check
```

Windows pnpm wrappers previously required retained literal quotes around parenthesized paths; use the already verified invocation form rather than counting a shell parsing failure as RED. Final applicable mutating normalization precedes checks and candidate freeze; require commit hooks to be convergent. Build may generate Prisma, not run migrations; stop on git-visible generated changes.

Forecast: approximately 500–700 authored additions plus deletions, including the existing 209-line plan/review, new ODD task, behavior/tests and normative reconciliation; provisional until implementation. Use ask-on-risk delivery, one coherent behavior/test unit where feasible; no assumed three-PR chain. If the final delivery exceeds the repository budget, ask once for a cohesive strategy without compressing or omitting proof. Future rollback removes these approved work units only, not accounts, session secrets or user data.

Parent owns native RDD mode readback, committed-slice risk assessment and candidate-specific consent. Native approval requires its actual terminal result; a user decline is not approval and does not disable the global mode. Prior HU-02 native candidates were declined, with independent functional/structural verification; none supplies HU-03 review authority. No review lifecycle is launched for this passive planning draft.

## Risks and next step

- PM-03: unconfirmed logout requires neutral non-success feedback and an enabled retry. Redirect/arrival alone is not proof; future acceptance must separately verify session null and denied protected access.
- Back navigation/browser caching and repeated logout need real browser proof; mocked calls do not prove cookie removal, CSRF or invalidation.
- Logout does not itself erase arbitrary application caches. Inspect actual sensitive state during bounded implementation before promising cleanup; do not add speculative storage deletion.
- HU-02 Stage B/full original CA-01 remains incomplete but does not prevent HU-03 planning. Production login/cookie behavior, assistive-technology announcements and retained prior acceptance-profile cleanup remain unproved/unresolved, not silently completed here.

Next: parent assesses the committed integration slice before separately authorizing isolated acceptance; stacked integration delivery toward `develop` is selected. Local implementation/native approach is authorized; L1/L2 are implemented and dashboard-integrated, not runtime-accepted; isolated runtime acceptance needs separate permission. L1/L2 deterministic implementation is checked; runtime/closure tasks remain unchecked.

**Memory status:** Engram mirror pending because authoritative runtime session binding is unavailable. No memory write or remembered session identity is used in this planning task.
