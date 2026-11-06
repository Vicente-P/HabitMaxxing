# HU-13 — Monthly heatmap (SCRUM-18)

Monthly day statuses in `GET /api/habits/:id/logs?month=YYYY-MM` and the mockup "Actividad" card on the habit detail page, in its month view, with a day detail panel.
Contract: `docs/specs/logs/stats.md` section 2; story: `docs/wiki/backlog.md` HU-13; visual source: mockup `HabitDetail` heatmap section in `docs/design/mockup/desktop-flow.jsx` (card, title/subtitle, cells, legend) and `Heatmap`/`YearHeatmap` in `atoms.jsx`. Branch `feature/SCRUM-18-heatmap`, stacked on `feature/SCRUM-19-cumplimiento` (HU-14, PR #41).

## Specs

- S1: Pure domain function that builds the days of a month (`YYYY-MM`, UTC) for a habit given its logs, `frequency`, `today` and `createdOn`. Every day of the month appears once, in order, as `{ date, dayOfWeek, scheduled, status, log }` with `log` `{ id, completed, value }` or `null`. `status`: `completed` (scheduled, log `completed: true`; for numeric habits any saved value counts), `missed` (scheduled, before today, no log or `completed: false`), `pending` (scheduled and today not completed yet, or a future scheduled day), `not_scheduled` (weekday not in `frequency`, or a day before `createdOn`, per HU-14 L3). `scheduled` is false exactly when the status is `not_scheduled`.
- S2: `GET /api/habits/:id/logs?month=YYYY-MM` (`month` required) returns `200 { "data": { "habitId", "month", "days": [...] } }` with `Cache-Control: private, no-store`. A missing, invalid or repeated `month` returns 400 `VALIDATION_ERROR` "Datos de entrada inválidos" with detail `{ field: "month", message: "Formato de mes inválido. Usar YYYY-MM" }`; any other query parameter returns 400. A habit of another user and a missing habit return the same 404 `{ "error": { "code": "NOT_FOUND", "message": "Hábito no encontrado" } }`; no session returns 401. The existing `POST` on that route is unchanged.
- S3: The detail page `/habits/[id]` gains the mockup heatmap card (L2: "Sección del mockup, vista Mes (Recomendado)") for the current month: surface card with the title "Actividad del mes", a subtitle with the count of completed days, a 7-column calendar grid with weekday headers (Monday first, as the mockup's L-D order), and a legend. Colors (CA-01/CA-02): `completed` success, `missed` danger, `not_scheduled` neutral gray "sin penalización", `pending` a distinct neutral outline, all from `--hm-*` tokens. The mockup's Año/Mes/Semana tabs and the annual view are not rendered now.
- S4: Each day up to today is a button with an accessible name containing its date and status; future days are not interactive. Pressing a day shows a panel below the calendar (L2: "Panel debajo del calendario (Recomendado)") with the date, the status as "Cumplido" / "No cumplido" / "No programado" / "Pendiente", and the value with its unit for numeric habits (e.g. "5 km") when there is a log (CA-03: "cuando presiono un día pasado, entonces veo el detalle del registro de ese día"). Keyboard operable.
- S5: The repository gains whatever read the month needs (logs with id, date, completed and value for a habit, ideally bounded to a date range), covered by the shared contract suite in memory and on PostgreSQL.
- S6: `docs/specs/logs/stats.md` records the decisions (month view only, status rules incl. today pending and days before creation, 404, required `month`) and ticks the heatmap tests; the backlog records the HU-13 status.

## Tasks

- [x] T1 (S1-S6) - month days domain, GET logs route, repository read, Actividad card + day panel, tests, docs - worker - commit:
- [x] T2 (S1-S5) - parent review and checks (Risk: none expected; read-only) - parent - commit: n/a (reviewed; unit 664, integration 44, typecheck, lint 0 errors)

## Log

- L1 (user, verbatim): "continua" (after the proposal to continue EP-04 with HU-13 and HU-14 sequentially).
- L2 (user decisions, verbatim answers): HU-13: "Sección del mockup, vista Mes (Recomendado)"; day detail: "Panel debajo del calendario (Recomendado)".
- L3 (assumptions, agent): a scheduled today not completed yet is `pending` (consistent with the HU-12 streak); days before the habit's creation are `not_scheduled` (HU-14 L3).
