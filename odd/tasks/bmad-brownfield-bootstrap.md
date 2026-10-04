# BMad Brownfield Bootstrap

## Objective

Adopt the current BMad Method in HabitMaxxing as a brownfield experiment without implementing product features or replacing valid project documentation.

## Problem

The repository has substantial product, design, architecture, and engineering documentation, but no BMad runtime, BMad skills, or concise BMad project context. The bootstrap must reference existing sources of truth instead of duplicating them.

## Why

Establish a structured, reproducible AI-assisted development workflow that can later execute one small existing story through planning, implementation, testing, review, and quality gates.

## Scope

- Inventory existing repository artifacts and classify their readiness for BMad.
- Install the minimum useful BMad skills for Codex and run project setup.
- Adopt existing project instructions through a concise BMad context block.
- Validate installation, references, and existing project quality commands.
- Recommend the concrete BMad workflow and one pilot story.

## Out of Scope

- Implementing or refactoring product functionality.
- Replacing the existing backlog, specs, design system, architecture, or engineering guides.
- Fixing unrelated pre-existing quality failures.
- Publishing, pushing, or opening a pull request.

## Constraints

- Treat the repository as brownfield.
- Preserve uncommitted `.atl/skill-registry.md` and `.atl/.skill-registry.cache.json` changes.
- Use current official BMad documentation and commands only.
- Keep `AGENTS.md` concise and reference repository sources of truth.
- Require explicit approval before network installation or machine-level prerequisite changes.

## Delivery Strategy

- Strategy: `ask-on-risk`.
- Forecast: under 400 authored changed lines, excluding generated BMad runtime/skill files.
- Branch: `codex/bmad-brownfield-bootstrap`.

## Tasks

- [x] **BMB-001 — Discover repository and current BMad guidance**
  - Route: delegated direct.
  - Trigger: broad brownfield repository mapping and context compression.
  - Acceptance: product, design, architecture, engineering, and AI artifacts are classified; current official install and brownfield guidance is verified.
  - Evidence: explorer handoff; official BMad installation, existing-codebase, project-context, build, and skills documentation.
- [x] **BMB-002 — Install BMad prerequisites and selected Codex skills**
  - Route: delegated direct.
  - Trigger: network installation and multiple generated files.
  - Acceptance: required prerequisites are available; project-local BMad skills are installed using the current supported mechanism; setup completes.
  - Checks: installed skill directories, `_bmad/` runtime, `bmad status` or installed equivalent.
  - Evidence: `uv --version` returned `uv 0.12.23 (46b84fd0b 2026-10-03 x86_64-pc-windows-msvc)`. `npx skills add bmad-code-org/BMAD-METHOD --skill bmad bmod-core-tools bmod-method bmad-project-context bmad-spec bmad-ticket bmad-build bmad-code-review bmad-walkthrough bmad-qa-generate-e2e-tests --agent codex --copy --yes` completed and reported all 10 selected skills copied to the project. The initial sandboxed `npx skills add --help` stalled without output and was interrupted; the same help command with approved network access succeeded and documented `--skill`, `--agent`, `--copy`, and `--yes`. BMad setup question check (`uv run --no-cache .agents/skills/bmad/scripts/setup.py ... --list-config-questions`) returned `[]`; setup (`uv run --no-cache .agents/skills/bmad/scripts/setup.py ...`) returned `status: created`, `current: true`, version `6.13.0-next`, no pending questions or problems, and created shared scripts/config plus `_bmad/`. Installed status (`uv run --no-cache .agents/skills/bmad/scripts/setup.py ... --status`) returned `bmad_exists: true`, both modules at `6.13.0-next` with project scope, scripts/config current, `current: true`, no problems, and `next: null`; online module update checks were `could-not-check` because the sandboxed status process reported WinError 10013 socket access denied. All 10 requested `.agents/skills/<name>/SKILL.md` files and `_bmad/` were present. `git status --short` showed `M .atl/skill-registry.md`, `M skills-lock.json`, `?? .atl/.skill-registry.cache.json`, `?? _bmad/`, and `?? odd/`; pre-existing `.atl` changes were preserved. No project context was created and no product files were changed.
- [x] **BMB-003 — Adopt project context without duplicating sources of truth**
  - Route: delegated direct.
  - Trigger: generated context plus repository instruction integration.
  - Acceptance: BMad context references existing docs, preserves existing instructions, and validates every referenced path.
  - Checks: structural readback and BMad project-context validation.
  - Evidence: The user approved the complete proposed block and empty setup ledger. `AGENTS.md` was created with one balanced BMad marker pair. Every referenced repository path exists, `git diff --check -- AGENTS.md` passed, and the file preserves existing documentation as source-of-truth pointers. Runtime inspection found Node `v24.13.0` and pnpm `11.25.0`; the project declaration remains `pnpm@11.1.3` and the documented project baseline remains Node 22.
- [x] **BMB-004 — Validate bootstrap and existing project checks**
  - Route: delegated direct.
  - Trigger: tests, build, lint, and typecheck are execution tasks.
  - Acceptance: BMad installation is verified; lint, tests, typecheck, and build outcomes are recorded without unrelated fixes.
  - Evidence: BMad status exited 0 with local version `6.13.0-next`, `current: true`, and no integrity problems; online freshness probes were blocked by sandbox WinError 10013. `pnpm lint` and `pnpm typecheck` exited 0. `pnpm exec vitest run` exited 1 because the Vitest executable was unavailable, so no tests ran. `pnpm build` exited 1 after Prisma generation because Next.js could not fetch Inter from Google Fonts. Existing `.atl` files retained identical hashes. The verification run exposed `.agents/` by removing its pre-existing ignore entry; `.gitignore` was restored and the parent will force-add only the selected BMad skill directories.
- [x] **BMB-005 — Record recommended workflow and pilot story**
  - Route: inline.
  - Trigger: synthesis from verified evidence.
  - Acceptance: final report names preserved sources of truth, gaps, concrete BMad pipeline, pilot candidates, recommendation, and exact next prompt.
  - Evidence: The workflow below maps current BMad skills to the requested delivery path, preserves existing repository artifacts, and recommends HU-01 as the first controlled pilot.

## Current Artifact Classification

| Area | Classification | Source of truth |
|---|---|---|
| Product | EXISTS_BUT_NEEDS_ADAPTATION | `docs/wiki/backlog.md`, `README.md` |
| Design | EXISTS_AND_USABLE | `docs/specs/DESIGN_SYSTEM.md` |
| Architecture | EXISTS_BUT_NEEDS_ADAPTATION | `docs/architecture/`, ADRs, Prisma schema |
| Engineering | EXISTS_AND_USABLE | `docs/guides/`, `package.json`, CI and tooling configs |
| AI instructions | EXISTS_BUT_NEEDS_ADAPTATION | `.agents/skills/`, `.atl/skill-registry.md` |
| BMad runtime/workflow | EXISTS_AND_USABLE | `_bmad/`, project-local BMad skills, `skills-lock.json` |

## Verification Evidence

- BMB-001: completed from repository inspection and current official BMad documentation.
- BMB-002: completed; the 10 selected skills, `_bmad/` runtime, and installed status were verified. Status reports `current: true`; upstream freshness probes were unavailable in its sandboxed status run (WinError 10013).
- BMB-003: completed; the approved managed context block and all referenced paths were structurally verified.
- BMB-004: completed with partial verification; lint and typecheck passed, tests were unavailable, and build was blocked by an external font fetch.
- BMB-005: completed; the recommended workflow, pilot candidates, and exact next prompt are recorded below.

## Work-Unit Commits

- BMB-001/BMB-002 tracking and lockfile: `a54bdc4`.
- BMB-002 runtime: `8b38ca8`.
- BMB-003 project context: `77b9c99`.
- BMB-004 tracked skills and validation evidence: `10a0980`.
- BMB-005 workflow and pilot: `e7837cb`.

## Recommended BMad Workflow

1. Start from an existing backlog story and its repository spec.
2. For one bounded story, invoke `bmad-build` directly; it performs repository discovery, intent resolution, impact analysis, planning, implementation, tests, and independent review.
3. When a change is too large or its intent remains unclear, run `bmad-spec`, then use `bmad-ticket` to split it before invoking `bmad-build` for each ready entry.
4. Use `bmad-code-review` only for an additional standalone review, and `bmad-walkthrough` for the final human review.
5. Close with the applicable package and CI quality gates. Do not mark work complete when a required check is unavailable or failing.

## Pilot Story

Candidates:

1. **HU-01 — Registro de cuenta (`SCRUM-6`)**: recommended because it is foundational, has explicit acceptance criteria and a detailed repository spec, and the current implementation is still a placeholder.
2. **HU-06 — Crear hábito (`SCRUM-11`)**: well specified and testable, but depends on an authenticated user flow.
3. **HU-12 — Ver racha actual (`SCRUM-17`)**: algorithmically bounded and testable, but depends on habit logs and earlier MVP capabilities.

Recommended first pilot: **HU-01 — Registro de cuenta**. Keep the run bounded to `docs/wiki/backlog.md` and `docs/specs/auth/register.md`; any missing product decision should stop for user input rather than expand scope.

## Exact Next Prompt

Open a fresh Codex chat in this repository and send:

```text
$bmad-build Implementa HU-01 — Registro de cuenta (SCRUM-6) como primera historia piloto. Usa docs/wiki/backlog.md y docs/specs/auth/register.md como fuentes de verdad, junto con docs/architecture/auth-flow.md, docs/specs/models/user.md y docs/specs/DESIGN_SYSTEM.md. Trata el repositorio como brownfield, verifica el código actual antes de planificar, no amplíes el alcance y detente si una decisión de producto no puede resolverse con evidencia. Ejecuta los tests aplicables, lint, typecheck y build; no hagas push ni abras un PR.
```

## Next Step

Bootstrap complete. Start a fresh chat with the exact pilot prompt above when ready; do not implement the story in this bootstrap session.
