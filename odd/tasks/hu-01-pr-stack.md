# HU-01 Three-PR Stack

## Goal and authority
Deliver completed HU-01 as three dependent review slices linked to approved issue #11 in Vicente-P/HabitMaxxing.
Preserve original `feature/hu-01-account-registration` at `f407dc4`; no reset, rewrite, force push, merge, or deployment.
Publication uses only authorized origin push and existing GitHub CLI session; no other destinations or credentials.

## Baseline and topology
Verified clean baseline: `f407dc4660cfa74d6af68a603bd5a6e5bba5166c`.
Develop and current merge base: `e89509569f17004ac594b493f0e6284f04d82c19`.
1. `codex/hu-01-backend` -> `develop`: 244 authored lines, 400 gross including 156 lockfile lines.
2. `codex/hu-01-ui` -> `codex/hu-01-backend`: 308 authored/gross lines.
3. `codex/hu-01-docs` -> `codex/hu-01-ui`: 322 existing documentation lines plus this compact task, below 400.
Delivery strategy: three-PR stack, no tracker or size exception. New remote heads require readback before publication.

## Tasks
- [x] S1: Reconstruct backend/API/adapter and route tests from final bytes; normalize, verify, commit, assess, publish first slice.
- [x] S2: Reconstruct forms and component tests on S1; normalize, verify, commit, assess, publish dependent slice.
- [x] S3: Reconstruct documentary closure and this task on S2; verify final tree, commit, assess, publish final slice.
Route: delegated direct; one writer, sequential slices. Parent owns mirrors, native assessment, and publication coordination.

## Boundaries and safety
Backend: package.json, pnpm-lock.yaml, src/lib/prisma.ts, src/lib/validations.ts, src/lib/auth.ts, both API auth routes, tests/register-route.test.ts.
UI: both auth form pages and tests/validations.test.ts. Docs: remaining six final-diff Markdown files plus this task.
Use one isolated worktree under the user home; initialize its own CodeGraph only if needed. Do not copy another index or .env.
Final application source/test/package/lock bytes must equal f407dc4; no behavioral redesign or omitted tests/docs.
No manual generated edits, dependency/version changes, migrations, remote DB checks, or new auth sources.
Backend is exactly at the gross budget; additions require one cohesive repartition, never compression.

## Verification and closure
Normalize only slice files before final checks and commit; placeholders are process-local and loopback, never copied credentials.
S1: pnpm exec vitest run tests/register-route.test.ts; pnpm typecheck; pnpm lint; pnpm build; git diff --check.
S2: pnpm test -- --run; pnpm typecheck; pnpm lint; pnpm build; git diff --check.
S3: structural readback, frozen-intent preservation, final-tree byte comparison, and git diff --check; no redundant build.
After build, verify zero git-visible src/generated/prisma changes; stop without silent revert if changed.
Record exact command results, commit boundaries, native assessment outcomes, PR identities, and CI status without invented approval.
S1 `5c5a1c6`: 400 gross/244 authored lines; exact final bytes, 10 route tests/typecheck/lint/build/diff passed, generated unchanged; native review explicitly declined and independent verification passed. Published [PR #12](https://github.com/Vicente-P/HabitMaxxing/pull/12) to develop. S2 `49613cc`: 308 lines; 23 tests/typecheck/lint/build/diff passed; native medium under_budget, not approval. Published [PR #13](https://github.com/Vicente-P/HabitMaxxing/pull/13) to backend. S3 `eb0327e`: seven docs/359 lines; all 17 canonical blobs and modes preserved, frozen intent/local links/diff passed; native explicitly declined and independent structural verification passed. Published [PR #14](https://github.com/Vicente-P/HabitMaxxing/pull/14) to UI. All link approved issue #11 with type:feature. GitHub CI validate/typecheck/lint/build and Vercel succeeded for #12; CI targets develop/main, so no CI run is claimed for stack-base #13/#14. Their Vercel previews succeeded before bookkeeping push; Supabase Preview skipped for all. Latest #14 preview may restart after this passive task update; merge/deployment remain unauthorized.
