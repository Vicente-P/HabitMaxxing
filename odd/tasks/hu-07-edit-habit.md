# HU-07 — Edit habit (SCRUM-12)

`PATCH /api/habits/:id` plus an edit mode for the habit form, reached from an "Editar" button on each "Mis hábitos" card.
Contract: `docs/specs/habits/update.md`; story: `docs/wiki/backlog.md` HU-07. Branch `feature/SCRUM-12-editar-habito`.

## Specs

- S1: `PATCH /api/habits/:id` partially updates `name`, `unit` and `frequency` of the owner's habit with the same validations as creation (name trimmed 1-100, unit trimmed 1-30, frequency integers 0-6, unique, at least one, stored sorted). Success: `200 { "data": <habit> }`, `Cache-Control: private, no-store`.
- S2: The type is not editable (L2: "No se edita el tipo"). A body with `type` returns 400 `VALIDATION_ERROR` with detail `{ field: "type", message: "El tipo de un hábito no se puede modificar" }`. `unit` on a BINARY habit returns 400 `{ field: "unit", message: "Los hábitos binarios no tienen unidad" }`; `unit: null` or empty on a NUMERIC habit returns 400 `{ field: "unit", message: "La unidad es obligatoria para hábitos numéricos" }`. Unknown keys return 400. An empty body returns 400 `{ field: "form", message: "Debes enviar al menos un campo para actualizar" }`. Rejected requests change nothing.
- S3: A habit of another user and a missing habit both return 404 `{ "error": { "code": "NOT_FOUND", "message": "Hábito no encontrado" } }`, identical (L2: "Usa buenas practicas. ¿Que sentido tiene que yo vea los habitos de otro usuario? La plataforma o aplicación es personal"). No session returns 401 `UNAUTHORIZED`. Origin and content-type checks match the other mutating habit routes. The write itself is scoped by owner, and `userId` can never change.
- S4: When the new `frequency` removes days on which the habit has logs, the response is `200` with `"warnings": [{ "code": "FREQUENCY_DAYS_REMOVED", "message": "Los registros de ese día no serán eliminados", "removedDays": [<removed days that have logs, sorted>] }]`. The logs persist. Without such days there is no `warnings` key.
- S5: The repository port gains `update(habitId, ownerId, changes)` (owner-scoped, `null` when foreign or missing) and `loggedWeekdays(habitId)`; both are part of the shared contract suite, run in memory and on PostgreSQL.
- S6: Each "Mis hábitos" card has an "Editar" button (mockup `edit` icon). It opens the habit form prefilled in edit mode: heading "Editar hábito", the type shown as text (not editable), submit "Guardar cambios", and a "Cancelar edición" button that returns to "Crear hábito" (L2: "Botón Editar en Mis hábitos").
- S7: After saving, "Mis hábitos" and the daily agenda reflect the changes without reloading the page (CA-01: "los cambios se reflejan inmediatamente en el dashboard").
- S8: When the response has the `FREQUENCY_DAYS_REMOVED` warning the form shows "Los registros de ese día no serán eliminados" (CA-02).
- S9: `docs/specs/habits/update.md` records the decisions (404 instead of 403, type not editable, empty body 400) and the backlog records the HU-07 status.

## Tasks

- [x] T1 (S1-S5) - domain schema, use case, repository (contract, in-memory, Prisma), PATCH route, tests - parent - commit: e4007e1 (unit 483/483, integration 34/34 on PostgreSQL)
- [ ] T2 (S6-S8) - edit mode in the habit form, Editar button, agenda refresh, tests - parent - commit:
- [x] T3 (S9) - spec and backlog - parent - commit: (docs commit)
- [ ] T4 (S1-S8) - independent verification (Risk item 2: ownership guard) - gentle-ai-verify - commit: n/a

## Log

- L1 (user, verbatim): "Continua con HU-07"
- L2 (user decisions, verbatim answers): foreign habit: "Usa buenas practicas. ¿Que sentido tiene que yo vea los habitos de otro usuario? La plataforma o aplicación es personal" (resolved as uniform 404, as in HU-10); type change: "No se edita el tipo"; edit UI: "Botón Editar en Mis hábitos (Recomendado)" (Editar on each catalog card, reusing the create form prefilled).
- L3 (decision, agent, within spec latitude): an empty PATCH body returns 400 (the spec allows 200 or 400).
