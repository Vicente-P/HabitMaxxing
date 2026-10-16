# HU-03 / SCRUM-8 — Product requirements review

**Gate: local implementation authorized; bootstrap handoff pending.** On 2026-10-07 the owner approved PM-01–PM-03, native Auth.js implementation, tests and local commits on a new branch. This review is not implementation or runtime proof; isolated acceptance and publication remain unauthorized. No native/security approval is claimed.

- Reviewer: John, Product Manager (independent scoped review).
- Review date: 2026-10-07 (America/Santiago).
- Baseline: `d3f3c3df668096fc6f97980defdae0f326a7a24c`.
- Candidate: product-decided, local-implementation-authorized [HU-03 planning draft](plan-hu-03-logout.md), not a PRD.
- Authorization: original scoped requirements review; subsequent owner authorization permits native Auth.js local implementation/tests/commits (2026-10-07), not runtime acceptance or publication.
- No code, requirements, configuration, account, branch, or publication changes.

## Decision summary

| ID | Original severity | Decision status | Approved boundary |
|---|---|---|---|
| PM-01 | High (original finding) | Resolved by owner decision 2026-10-07 | Current-browser cookie/session removal only; copied-token and all-device revocation excluded. Not implemented or observed. |
| PM-02 | High (original finding) | Resolved by owner decision 2026-10-07 | Future logout/dashboard stage acceptance requires proof; habits API remains deferred to HU-06 and original full story incomplete. Not implemented or observed. |
| PM-03 | Medium (original finding) | Resolved by owner decision 2026-10-07 | Unconfirmed logout shows neutral non-success feedback and re-enables retry; login arrival/redirect alone is not session-end proof. Not implemented or observed. |

PM-01–PM-03 are resolved by the owner, not by reviewer or native approval. Original findings/evidence are retained as history; local implementation is now authorized, while implementation outcomes and runtime proof remain pending.

## Findings

### PM-01 — Original boundary finding; resolved by owner decision

**Evidence:** [spec](../../docs/specs/auth/logout.md) lines 14, 54 and 73; [backlog](../../docs/wiki/backlog.md) lines 124–128; [plan](plan-hu-03-logout.md) lines 34, 40 and 46; `src/lib/auth.ts:8–9`.

The user benefit is protecting data on shared devices. The criteria say the session is invalidated, while the proposed solution removes this browser's cookie and excludes copied JWTs and other devices. The application uses JWT sessions. These are different guarantees; cookie removal is not evidence of global token revocation.

**Product impact:** An owner could accept ordinary browser logout while a tester interprets invalidation as every credential becoming unusable. That disagreement changes scope, security expectations and the one-point story's feasibility.

**Owner decision (2026-10-07):** Approved current-browser cookie/session removal only, explicitly excluding copied JWTs and other devices. The original finding/evidence above is retained as review history; this decision does not prove implementation.

**Acceptance consequence:** After confirmed logout, the same browser has no usable session cookie, `/api/auth/session` is null, and a fresh protected request requires login. Do not claim that this proves copied-token or all-device revocation.

### PM-02 — Original staged-completion finding; resolved by owner decision

**Evidence:** [spec](../../docs/specs/auth/logout.md) lines 55 and 61–65; [plan](plan-hu-03-logout.md) lines 35, 41, 67 and 99; [architecture](../../docs/architecture/auth-flow.md) lines 87–99; [backlog](../../docs/wiki/backlog.md) lines 104 and 117.

CA-02 describes protected-route redirection. The required-test list also demands an API 401 from `/api/habits`, but authenticated habits readback is deferred to HU-06. At the original review, the plan proposed leaving that assertion unchecked without an approved completion boundary; the owner decision below now resolves that gap.

**Product impact:** Dashboard proof could be incorrectly presented as completion of every original required test, or HU-03 could remain needlessly blocked on an absent habits feature. A page redirect and an API 401 are distinct expected outcomes, not substitutes.

**Owner decision (2026-10-07):** Approved future logout/dashboard stage acceptance after observed proof, with `/api/habits` deferred to HU-06 and original full-story completion still incomplete. Original finding/evidence retained as history; this decision is not an acceptance pass.

**Acceptance consequence:** Check the dashboard's fresh request, direct navigation and browser-back outcome now. Keep `/api/habits` unchecked until the actual protected endpoint exists; a nonexistent endpoint or mocked 401 cannot satisfy it.

### PM-03 — Original failure-contract finding; resolved by owner decision

**Evidence:** [plan](plan-hu-03-logout.md) lines 42, 68, 70 and 96; [spec](../../docs/specs/auth/logout.md) lines 40, 65 and 78; installed `node_modules/next-auth/react.js:187–210`.

At the original review, the plan proposed neutral feedback and restored usability without an approved measurable failure contract; CA-01/CA-02 described only successful logout. The installed helper posts form data, reads JSON and assigns the returned/fallback URL; its redirect branch does not itself verify session null. A rejected call and an uncertain session outcome must not become a reassuring success claim.

**Product impact:** On a shared device, misleading feedback may cause someone to leave while access remains active. Tests also need a specific visible outcome rather than merely asserting that an error was caught.

**Owner decision (2026-10-07):** If logout cannot be confirmed, show neutral non-success feedback and re-enable the logout button for retry. Arrival or redirect to `/login` alone is not proof that the session ended. Exact neutral Spanish copy remains for authorized implementation; no extra protocol or status contract is approved.

**Acceptance consequence:** A controlled failure restores a usable control and exposes neutral feedback without claiming success. A pending attempt prevents duplicate submission. Repeated/no-session attempts have no critical user-facing error. Real acceptance verifies session/access separately from arrival at login.

## Acceptance coverage checklist

| Criterion or proof | Coverage in draft | Review status |
|---|---|---|
| CA-01: authenticated user can choose logout | Planned accessible control and deterministic interaction tests | Proposed; not observed |
| CA-01: login destination | Explicit `/login` target | Clear; not observed |
| CA-01: invalidated session | Cookie removal plus session-null browser proof | PM-01 owner-approved 2026-10-07; not implemented or observed |
| CA-02: direct protected dashboard access | Existing server guard plus fresh postlogout navigation | Clear within dashboard scope; not observed |
| CA-02: browser Back does not restore usable protected access | Explicit real-browser check | Planned; distinguish cached display from new authorized access |
| Required habits API 401 | Owner-approved deferral, unchecked | PM-02 resolved 2026-10-07; pending HU-06; original full story incomplete |
| Failure, pending and repeated attempts | Planned tests and browser checks | PM-03 failure outcome resolved 2026-10-07; pending/repeated behavior remains proposed; not observed |
| Keyboard and 320 px usability | Included in isolated acceptance | Planned; not assistive-technology certification |

No checkmark above represents runtime acceptance. Mocked native calls do not prove cookie removal, CSRF, server authorization or browser-cache behavior.

## Nonblocking reconciliation and scope

- The transport notes are stale: the spec's no-body/no-JSON claims (lines 34 and 40) conflict with installed `next-auth/react.js:190–203`. The backlog's custom endpoint/front-end token tasks (lines 131–132) also differ from the native proposal. The draft already identifies reconciliation; update those documents only after authorization, not in this review.
- Native transport and server-guard reuse are implementation choices serving the approved outcome, not new product criteria. No second auth stack, middleware duplication or manual token policy is required by this review.
- The existing dashboard returns only its heading (`src/app/(dashboard)/dashboard/page.tsx:10–14`). The spec's client-cache cleanup note (line 77) and plan's bounded inspection (line 98) justify checking actual sensitive state, not speculative storage deletion. Decide any discovered privacy-relevant state against the shared-device benefit.
- Other open tabs may retain rendered content even though cookies are shared. The draft does not promise all-tab content erasure. Do not silently add that promise or infer it from a successful fresh server request; escalate a concrete sensitive-display finding if one exists.
- Keep HU-04, habit implementation, account deletion, schema work, production accounts and deployment outside this story's scope.

## Realistic proof and privacy

1. PM-01–PM-03 and native local implementation are owner-authorized; complete bootstrap readback/delivery choice before source work. This report is not runtime proof or security approval.
2. Use the proposed existing deterministic runner for native invocation, pending, retry and guard regressions.
3. Obtain separate isolated local account/database/browser permission before real acceptance. Prior HU-02 evidence is baseline context, not HU-03 proof.
4. Verify native cookie/session removal, fresh dashboard denial, direct/Back navigation and repeat/no-session behavior on the final candidate.
5. Record failures, unexecuted checks and the habits dependency explicitly. Do not retain credentials, cookie values or private account/session contents in acceptance artifacts.

Production GET smoke checks cannot certify functional logout. Local browser acceptance cannot certify production cookie security, all-device revocation or assistive-technology announcements.

## Review provenance and checks

- Loaded the installed John PM skill and cognitive documentation skill before review.
- Executed installed customization/config resolvers with `C:/Python314/python.exe`; both succeeded without setup or downloads.
- Resolved persona: John / Product Manager, icon 📋. Prepend/append hooks and persistent facts were empty.
- `core.output_folder` resolved to `{project-root}/_bmad-output`; `core.active_initiative` was unset and left unchanged. This explicitly authorized report path defines the review workspace.
- No PM menu item maps to this scoped story conversation; no full PRD workflow or formal PRD certification was invoked.
- CodeGraph status showed pending changes and its `signOut` query returned no match. Narrow known-file/package readback supplied the evidence without index mutation.
- Structural verification: report readback, relative file-link targets, balanced fences and whitespace; tracked diff check and protected-file hash comparison.
- Tests/build: not run; not applicable to this report-only review. No functional pass is claimed.

## Next step

Parent reads back the new ODD task and resolves delivery strategy before source writes/commits. Native local implementation is owner-authorized; isolated runtime acceptance needs separate permission and no acceptance pass is claimed.
