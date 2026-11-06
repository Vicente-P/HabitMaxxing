# HU-15 — Responsive navigation (SCRUM-20)

App shell with the mockup navigation: desktop sidebar and mobile bottom tab bar, and the split of "Hoy" (`/dashboard`) and "Hábitos" (`/habits`).
Story: `docs/wiki/backlog.md` HU-15; visual source: mockup `Sidebar`/`SidebarNav`/`Logo` in `docs/design/mockup/desktop-dashboards.jsx` and `MobileTabBar` in `docs/design/mockup/mobile-screens.jsx`. Branch `feature/SCRUM-20-navegacion-responsive` (from develop 87b822e).

## Specs

- S1: A shared shell for the authenticated pages (`/dashboard`, `/habits`, `/habits/[id]`) in a `(dashboard)` layout. Desktop (≥ `lg`): the mockup left sidebar (width 232 px, right border) with the `Logo`, the "NAVEGAR" label, the nav items "Hoy" (home icon) and "Hábitos" (list icon) with the mockup active state (surface-2 background, 2 px accent bar, bold), and at the bottom the user block (avatar with initials, name or email) with "Cerrar sesión". The main content is to the right and uses the horizontal space (CA-02: "el layout aprovecha el espacio horizontal disponible").
- S2: Mobile (< `lg`): no sidebar; a fixed bottom tab bar following `MobileTabBar` with "Hoy", the round accent "+" button (accessible name "Crear hábito") and "Hábitos", active tab in accent; a compact top header with the `Logo` and "Cerrar sesión". Content gets bottom padding so the tab bar never hides it. L2: "Tab bar del mockup (Recomendado)", replacing the backlog's hamburger (T-63).
- S3: Routes (L2: "Sí: /dashboard = Hoy, /habits = Hábitos (Recomendado)"): `/dashboard` shows only "Agenda de hoy"; the new `/habits` shows "Crear hábito" and "Mis hábitos" (edit, delete and the detail links keep working, and the agenda refresh after create/edit/delete is no longer needed across pages, but data must be fresh when navigating to Hoy). `/habits` redirects to `/login` without a session, like `/dashboard`. The "+" goes to the create form (e.g. `/habits#crear-habito`) and focuses its "Nombre" field. The detail page's "Volver" and breadcrumb "Hábitos" lead to `/habits`. Login keeps landing on `/dashboard`.
- S4: Active navigation item: "Hoy" on `/dashboard`, "Hábitos" on `/habits` and `/habits/[id]`, exposed with `aria-current="page"`. Only real destinations are rendered: the mockup's Estadísticas, Calendario, Configuración, the Nivel/XP card and counters are omitted (L2: "Omitirlos por ahora (Recomendado)").
- S5: CA-01 ("todos los elementos son accesibles sin necesidad de hacer zoom"): at 375 px no page has horizontal overflow, every interactive element of the shell is at least 44 × 44 px, and nothing is covered by the tab bar. Verified with E2E at 375 and 1280 px (T-62) on `/dashboard`, `/habits` and `/habits/[id]`, with screenshots.
- S6: The content of the pages is not redesigned (L2: "No, solo layout y navegación (Recomendado)"); existing sections only move between `/dashboard` and `/habits`.
- S7: Docs: backlog HU-15 status line (and T-63 noted as tab bar per the mockup); unit and E2E tests updated for the new routes.

## Tasks

- [x] T1 (S1-S7) - layout shell, sidebar, tab bar, /habits route, nav state, unit + E2E tests, docs - worker - commit: 4491aba
- [x] T2 (S1-S5) - parent: review, run checks, screenshots against the mockup - parent - commit: n/a (orphaned dashboard-habits removed; unit 693, E2E 15, typecheck, lint 0 errors; screenshots match the mockup shell)

## Log

- L1 (user, verbatim): "si, continua" (merge #44 and start HU-15).
- L2 (user decisions, verbatim answers): mobile nav: "Tab bar del mockup (Recomendado)"; sections: "Sí: /dashboard = Hoy, /habits = Hábitos (Recomendado)"; items without a page: "Omitirlos por ahora (Recomendado)"; scope: "No, solo layout y navegación (Recomendado)".
