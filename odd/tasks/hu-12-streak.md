# HU-12 — Current streak (SCRUM-17)

Streak calculation, `GET /api/habits/:id/stats` (streak only for now) and a new habit detail page `/habits/[id]` showing it.
Contract: `docs/specs/logs/stats.md` section 1; story: `docs/wiki/backlog.md` HU-12; visual source: `docs/design/mockup/desktop-flow.jsx` (`HabitDetail`) and `mobile-screens.jsx` (`MobileHabitDetail`). Branch `feature/SCRUM-17-racha-actual` (worktree `../habitmaxxing-hu12`). Runs in parallel with HU-08 (`odd/tasks/hu-08-delete-habit.md` in the main checkout).

## Specs

- S1: Pure domain function `calculateStreak(logs, frequency, today)` (dates `YYYY-MM-DD`, UTC calendar days as in the rest of the app, `frequency` weekdays with Sunday = 0). Walk scheduled days backwards from `today`. Today: completed counts +1; not completed (no log or `completed: false`) does not break and does not count, because the day is not over. Each earlier scheduled day completed adds +1; the first earlier scheduled day not completed ends the current streak. Non-scheduled days are ignored: they neither break nor add (CA-03: "los días no programados no rompen ni suman a la racha"). Days before the habit's first log cannot extend a streak.
- S2: `previous` is the length of the streak that was broken most recently before the current position (L2: "La racha que se acaba de romper (Recomendado)"): with completed runs 12, then a miss, then nothing, `current: 0, previous: 12`. When `current > 0`, `previous` is the run before the miss that precedes the current run (0 when there is none). `isActive` is `current > 0`.
- S3: `GET /api/habits/:id/stats` returns `200 { "data": { "habitId": "<id>", "streak": { "current": n, "previous": n, "isActive": bool } } }` with `Cache-Control: private, no-store` (L2: "/stats, solo racha por ahora (Recomendado)"; `month` and `completion` arrive with HU-14). Any query parameter returns 400 `VALIDATION_ERROR` for now. A habit of another user and a missing habit return the same 404 `{ "error": { "code": "NOT_FOUND", "message": "Hábito no encontrado" } }` byte-identical; no session returns 401 `UNAUTHORIZED`.
- S4: The repository port gains a read of the habit's log days (date and completed), covered by the shared contract suite in memory and on PostgreSQL.
- S5: New page `/habits/[id]` (L2: "Crear la pantalla de detalle (Recomendado)"), protected like `/dashboard` (no session redirects to `/login`; a foreign or missing habit renders the not-found page). Structure follows the mockup `HabitDetail` / `MobileHabitDetail` for the parts in scope: top bar with "Volver" to `/dashboard` and the breadcrumb "Hábitos / <name>", hero with the habit name as `h1`, the streak line "🔥 Racha actual: X días" (CA-01, "1 día" when X is 1, mockup flame icon and accent color), the type and frequency text, and, when `current` is 0 and `previous` > 0, "Racha anterior: X días" (CA-02). Out of scope now and not rendered: the mockup's Editar/Eliminar buttons, "Marcar hoy", stat grid and heatmaps (HU-13/HU-14 and later).
- S6: In "Mis hábitos" the habit name on each card links to `/habits/<id>` (only the name becomes a link; the card layout and its buttons stay as they are).
- S7: `docs/specs/logs/stats.md` records the decisions (today pending does not break, `previous` = most recently broken streak, endpoint `/stats` streak-only, 404 for foreign habits) and the backlog records the HU-12 status.

## Tasks

- [x] T1 (S1-S7) - streak domain, repository read, `/stats` route, detail page, catalog link, tests, docs - worker - commit:
- [ ] T2 (S1-S3) - parent review and checks (Risk: none expected; read-only endpoint) - parent - commit: n/a

## Log

- L1 (user, verbatim): "Dale" (approving HU-08 and HU-12 in parallel), after "Sí haz el merge. ¿Podemos trabajar en varias HU al mismo tiempo?"
- L2 (user decisions, verbatim answers): where: "Crear la pantalla de detalle (Recomendado)"; previous: "La racha que se acaba de romper (Recomendado)"; endpoint: "/stats, solo racha por ahora (Recomendado)". Worktree: "Sí, crealo ahí".
- L3 (assumption, agent, from the spec "Iterar hacia atrás desde hoy (o último día programado transcurrido)"): a scheduled today that is not completed yet does not break the streak.
