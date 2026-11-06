# ADR-07 — Tests E2E con Playwright

## Estado

Aceptado (2026-11-05). El usuario aprobó agregar tests E2E al proyecto (cambio de tooling) en lugar de un script puntual o de probar contra el preview de Vercel. Feature de seguimiento: `odd/tasks/e2e-playwright.md`.

---

## Contexto

Vitest + jsdom no cubre lo que solo ocurre en un navegador: cookies de sesión de Auth.js, redirecciones, el elemento `<dialog>` modal, el layout responsive y la hidratación real. Las revisiones visuales contra el mockup se hacían a mano y sin evidencia versionada. Los flujos de HU-07, HU-08, HU-12, HU-13 y HU-14 ya están implementados y estables.

---

## Decisión

1. **`@playwright/test` como devDependency**, solo Chromium (`pnpm exec playwright install chromium`, en la cache estándar de Playwright). Tests en `e2e/*.spec.ts`; script `pnpm test:e2e`.
2. **Alcance:** pocos flujos críticos con locators por rol, etiqueta y texto en español: registro, crear hábito binario y numérico, marcar y registrar valor, editar (con la advertencia de días retirados), detalle (racha, cumplimiento, actividad, panel del día) y eliminar con confirmación. Más comprobaciones de layout (sin desbordamiento horizontal, diálogo visible y usable) a 375 px y 1280 px, y capturas de página completa en `e2e/screenshots/` sin aserciones de snapshot.
3. **Aislamiento de datos** (misma filosofía que ADR-06):
   - `e2e/global-setup.ts` levanta un PostgreSQL con Testcontainers reutilizando `POSTGRES_IMAGE`, `TEST_DATABASE_NAME`, `assertSafeTestDatabase` y la función `migrate` (extraída a `src/test/integration/migrate.ts` y compartida con la suite de integración).
   - La aplicación se construye (`next build`) y se sirve (`next start`) en el puerto 3100 con `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (aleatorio y descartable), `AUTH_URL` y `APP_ORIGIN` pasados de forma explícita. Next solo carga `.env` para variables ausentes, por lo que `.env` no puede aportar ninguna de ellas.
   - Se usa `globalSetup` y no `webServer` porque este último arranca antes que el hook y la base debe existir antes que el servidor. El orden queda garantizado por construcción: contenedor → salvaguarda → migraciones → build → servidor → tests.
   - Cada test registra su propio usuario (correo con UUID) por la interfaz; los hábitos se programan los siete días para que "hoy" siempre esté programado.
   - Al terminar se cuenta cuántos usuarios hay en el contenedor (evidencia de que la app lo usó) y se detienen servidor y contenedor.
4. **`next build` + `next start`** en lugar de `next dev`: comportamiento realista de producción y sin compilación bajo demanda durante los tests. Coste: el build escribe en `.next`, así que no debe ejecutarse con `next dev` activo.
5. **Un solo worker, sin reintentos**, para resultados deterministas; se prefieren aserciones web-first sin esperas fijas.
6. **Vitest no recoge `e2e/`** (excluido del proyecto `unit`); `tsc` y `eslint` sí revisan los tests; las salidas de Playwright están en `.gitignore` e ignoradas por ESLint.

### Alternativas descartadas

- **Script puntual de navegador:** no deja evidencia ni regresiones versionadas.
- **Probar contra el preview de Vercel:** usa la base de datos real de Supabase y depende de red y credenciales.
- **`next dev` + `webServer`:** el servidor arrancaría antes que la base aislada, y la compilación bajo demanda vuelve los tiempos impredecibles.
- **Varios navegadores:** coste de descarga y mantenimiento sin valor adicional hoy.

---

## Riesgos

- **Docker obligatorio** para `pnpm test:e2e` (igual que la integración). El comando unitario no cambia.
- **No está en el CI todavía**, por el bloqueo de facturación de GitHub; se añadirá un job informativo cuando el CI vuelva a ejecutarse (como el job de integración, ADR-06).
- **Descarga de Chromium** (~120 MB en la cache de Playwright) en cada máquina o runner nuevo.
- **Día calculado en UTC:** la app resuelve "hoy" en UTC; los tests usan `getUTCDay()` y programan todos los días. Una ejecución que cruce la medianoche UTC podría fallar de forma intermitente.
- **Capturas sin comparación automática:** la revisión visual contra el mockup sigue siendo humana.
