# E2E browser tests with Playwright

Add versioned Playwright end-to-end tests that run the real app in Chromium against a disposable PostgreSQL, covering the flows built in HU-07, HU-08, HU-12, HU-13 and HU-14, and produce screenshots for a visual comparison with the mockup.
Branch `chore/e2e-playwright` (from develop 03abeb7). Tooling change approved by the user (L2).

## Specs

- S1: `@playwright/test` as a devDependency, a `playwright.config.ts` and a `test:e2e` script. Only Chromium (installed with `pnpm exec playwright install chromium` into the standard cache `C:\Users\vpere\AppData\Local\ms-playwright`, L3). Test files live in `e2e/` and are never collected by Vitest (`pnpm exec vitest run` and `pnpm test:integration` keep their counts) nor break `pnpm typecheck` / `pnpm lint`.
- S2: Isolation: the E2E run starts its own PostgreSQL with Testcontainers (reuse `src/test/integration/` helpers and `assertSafeTestDatabase`; host localhost, database name containing `test`), applies the committed migrations, and starts the app on a dedicated localhost port with explicit `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (throwaway), `AUTH_URL` and `APP_ORIGIN` for that port. It never reads the database URLs or secrets of `.env`, and stops the container afterwards. Each test uses its own freshly registered user.
- S3: Flows, each asserting what the user sees: register a new account and land on the dashboard; create a binary and a numeric habit; mark the binary habit done in the daily agenda and register a numeric value ("5 km"); edit a habit from "Mis hábitos" (prefilled form, "Cambios guardados.", and the warning "Los registros de ese día no serán eliminados" when removing a day that has a log); open the detail page from the catalog link and see "Racha actual", "Cumplimiento mensual", "Actividad del mes", and the day panel after pressing today; delete a habit: "Cancelar" keeps it, confirming "¿Estás seguro? Esta acción no se puede deshacer" removes it from catalog and agenda.
- S4: Layout checks at a narrow viewport (375 px) and desktop (1280 px) for the dashboard and the detail page: no horizontal overflow of the page, and the dialog is visible and usable.
- S5: Full-page screenshots of dashboard, edit mode, delete dialog and detail page at both widths, saved to a gitignored folder (e.g. `e2e/screenshots/`) for review; no snapshot assertions.
- S6: Docs: `docs/guides/testing.md` explains the E2E layer, how to run it and its Docker requirement; a new ADR `docs/architecture/decisions/ADR-07-tests-e2e-con-playwright.md` records the decision (scope, isolation, not in CI yet because of the billing lock); `.gitignore` covers Playwright outputs.

## Tasks

- [x] T1 (S1-S6) - Playwright setup, isolated DB and server, flows, layout checks, screenshots, docs - worker - commit:
- [x] T2 (S3-S5) - parent: run, read the screenshots against the mockup, report findings - parent - commit: n/a (screenshots reviewed; findings in L4)

## Log

- L1 (user, verbatim): "haz la prueba en el navegador. ¿Puedes usar play wright? o ¿Usar el mismo  preview de vercel?"
- L2 (user decision): "Agregar tests E2E al proyecto" (over a one-off script or the Vercel preview).
- L3 (user consent): Chromium download to `C:\Users\vpere\AppData\Local\ms-playwright`: "Sí, descargalo ahí".
- L4 (evidence, parent screenshot review against the mockup): 7/7 E2E pass. Findings in already-merged UI (not fixed here): (a) the flame icon of the "Racha actual" line on the detail page is invisible (`fill-current stroke-0` loses to the base `fill-none`, so it has neither fill nor stroke); (b) "Agenda de hoy" does not refresh after creating a habit (only edit/delete bump its refreshKey); (c) the dashboard does not follow the mockup structure (no sidebar or mockup dashboard layout), pre-existing, belongs with HU-15; (d) the month grid uses only part of the "Actividad" card width on desktop. Full-page screenshots cannot judge the fixed `<dialog>` position; it looked usable at 375 px.
- L5 (evidence): findings (a), (b) and (d) of L4 fixed on `fix/detail-and-agenda-ui` with RED first (`e2e/regressions.spec.ts`: 3 failing for the expected reasons, plus a unit assertion that creation notifies the dashboard); after the fix E2E 10/10, unit 664/664, typecheck, lint 0 errors. Finding (c) stays for HU-15.
