# HU-14 — Monthly completion (SCRUM-19)

Monthly completion percentage in `GET /api/habits/:id/stats` and a stat grid on the habit detail page.
Contract: `docs/specs/logs/stats.md` section 1 (completion); story: `docs/wiki/backlog.md` HU-14; visual source: mockup `HabitDetail` stat grid (`BigStat`) in `docs/design/mockup/desktop-flow.jsx`. Branch `feature/SCRUM-19-cumplimiento`. HU-13 (heatmap) follows on top of this work, sequentially.

## Specs

- S1: Pure domain function `calculateCompletion(logs, frequency, month, today, createdOn)` (UTC calendar days, `month` `YYYY-MM`, `createdOn` the habit's creation date `YYYY-MM-DD`). `scheduledDaysElapsed` = scheduled days of `month` from the later of the 1st and `createdOn`, up to the earlier of `today` and the month's last day, today included (spec: "días programados en el mes que ya pasaron (incluye hoy)"). `completedDays` = those with a log `completed: true`. `percentage = completedDays / scheduledDaysElapsed × 100` rounded to 1 decimal (6 of 7 → `85.7`); 0 when `scheduledDaysElapsed` is 0. Non-scheduled days never count (CA-01: "calculado solo sobre días programados transcurridos"). A future month has 0 elapsed days.
- S2: `message` is `"Cumplimiento: 0% — ¡Empieza hoy!"` when `completedDays` is 0 (CA-02), otherwise `null`.
- S3: `GET /api/habits/:id/stats` accepts an optional `month=YYYY-MM` (default: current UTC month) and returns `200 { "data": { "habitId", "month", "streak": { "current", "previous", "isActive" }, "completion": { "percentage", "completedDays", "scheduledDaysElapsed", "message" } } }`. The streak stays as of today whatever the month. An invalid or repeated `month` returns 400 `VALIDATION_ERROR` "Datos de entrada inválidos" with detail `{ field: "month", message: "Formato de mes inválido. Usar YYYY-MM" }`; any other query parameter keeps returning 400. 401, the uniform 404 for foreign or missing habits and the headers stay as in HU-12.
- S4: The detail page `/habits/[id]` gains the mockup stat grid (`BigStat` structure: label, big value, suffix, icon) with two cards for the current month (L2: "Grilla de stats del mockup (Recomendado)"): "Racha actual" (value, suffix "días"/"día", flame icon, accent) and "Cumplimiento mensual" (value "X%", target icon), and the text "Cumplimiento: X% este mes" or, when `completedDays` is 0, "Cumplimiento: 0% — ¡Empieza hoy!". The mockup's "Racha más larga" and "Total completado" cards are not rendered. The existing streak line and "Racha anterior" stay.
- S5: `docs/specs/logs/stats.md` records the decisions (today counts in the denominator, days before creation excluded, message rule, `month` default and errors, 404) and ticks the completion tests; the backlog records the HU-14 status.

## Tasks

- [x] T1 (S1-S5) - completion domain, `/stats` month + completion, stat grid, tests, docs - worker - commit:
- [x] T2 (S1-S4) - parent review and checks (Risk: none expected; read-only) - parent - commit: n/a (reviewed; unit 623, integration 42, typecheck, lint 0 errors)

## Log

- L1 (user, verbatim): "continua" (after the proposal to continue EP-04 with HU-13 and HU-14 sequentially).
- L2 (user decisions, verbatim answers): HU-13: "Sección del mockup, vista Mes (Recomendado)"; HU-14: "Grilla de stats del mockup (Recomendado)"; day detail: "Panel debajo del calendario (Recomendado)".
- L3 (assumption, agent): days before the habit's creation date do not count as scheduled (neither in the completion denominator nor as missed in HU-13), so a habit created mid-month does not start penalized.
