# HU-08 — Delete habit (SCRUM-13)

`DELETE /api/habits/:id` (habit and all its logs, permanently) plus an "Eliminar" button with a confirmation modal on each "Mis hábitos" card.
Contract: `docs/specs/habits/delete.md`; story: `docs/wiki/backlog.md` HU-08. Branch `feature/SCRUM-13-eliminar-habito` (main checkout). Runs in parallel with HU-12 (`odd/tasks/hu-12-streak.md`, sibling worktree).

## Specs

- S1: `DELETE /api/habits/:id` permanently deletes the owner's habit and all its `HabitLog` rows (CA-01: "el hábito y todo su historial desaparecen permanentemente"). Success: `200 { "data": { "message": "Hábito eliminado exitosamente", "id": "<id>" } }`, `Cache-Control: private, no-store`. No body is required or read.
- S2: A habit of another user and a missing habit both return 404 `{ "error": { "code": "NOT_FOUND", "message": "Hábito no encontrado" } }`, byte-identical (same rule as HU-07/HU-10; the spec's 403 is replaced). Deleting the same habit twice: the second call returns that 404. No session returns 401 `UNAUTHORIZED` before any other check. The `Origin` check of the other mutating habit routes applies (403 `FORBIDDEN` "Solicitud no permitida"); there is no content-type requirement because there is no body. The delete itself is scoped by owner (`deleteMany` on `id` + `userId`), so a foreign habit is never deleted.
- S3: The repository port gains `delete(habitId, ownerId): Promise<boolean>` (true when the owner's habit was deleted; false when foreign or missing, deleting nothing), covered by the shared contract suite in memory and on PostgreSQL, including that the habit's logs are gone afterwards and other habits and their logs are untouched.
- S4: Each "Mis hábitos" card has an "Eliminar" button next to "Editar" (mockup `trash` icon, danger text color, accessible name `Eliminar <habit name>`). It opens a modal `<dialog>` styled as a card with `--hm-*` tokens showing "¿Estás seguro? Esta acción no se puede deshacer" (CA-02, verbatim) and the buttons "Cancelar" and "Eliminar" (danger). "Cancelar" and Escape close it without any request (L2: "Modal <dialog> con estilo card (Recomendado)").
- S5: Confirming sends one `DELETE`. On 200 the dialog closes, "Mis hábitos" and the daily agenda refresh without a page reload, and if that habit was open in edit mode the form returns to "Crear hábito". On 401 the session message "Tu sesión ya no está disponible. Inicia sesión nuevamente." is shown and the session is invalidated as in the catalog. On 404 the catalog reloads (the habit is already gone). Any other failure shows "No se pudo eliminar el hábito. Inténtalo de nuevo." and deletes nothing locally.
- S6: `docs/specs/habits/delete.md` records the decisions (404 instead of 403, owner-scoped delete, modal) and the backlog records the HU-08 status.

## Tasks

- [x] T1 (S1-S6) - endpoint, repository (contract, in-memory, Prisma), UI modal, tests, docs - worker - commit: fead61f
- [x] T2 (S1-S3) - independent verification (Risk items 1 and 2: irreversible delete, ownership guard) - gentle-ai-verify - commit: n/a (all S1-S5 pass on fead61f)

## Log

- L1 (user, verbatim): "Dale" (approving HU-08 and HU-12 in parallel), after "Sí haz el merge. ¿Podemos trabajar en varias HU al mismo tiempo?"
- L2 (user decisions, verbatim answers): confirmation UI: "Modal <dialog> con estilo card (Recomendado)". The backlog CA-01 already decides a permanent delete with cascade; foreign habit 404 follows the HU-07 decision ("Usa buenas practicas. ¿Que sentido tiene que yo vea los habitos de otro usuario? La plataforma o aplicación es personal").
- L3 (evidence): independent verify of fead61f: S1-S5 met; unit 538/538, integration 39/39, typecheck; owner-scoped deleteMany with no prior read, foreign vs missing indistinguishable, `checkHabitRequest` identical to the previous version over 448 combinations, one DELETE per confirmation. Advisories: real-browser `<dialog>` Escape behavior not tested; the confirm button's danger border is not in the mockup (which has no dialog); a 404 also refreshes the agenda.
