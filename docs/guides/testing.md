# Testing — Vitest + Testing Library

## Tabla de contenidos

- [Stack de testing](#stack-de-testing)
- [Estructura y convenciones](#estructura-y-convenciones)
- [Correr tests](#correr-tests)
- [Tests E2E con Playwright](#tests-e2e-con-playwright)
- [Tests unitarios](#tests-unitarios)
- [Tests de componentes](#tests-de-componentes)
- [Cobertura](#cobertura)
- [Setup del entorno](#setup-del-entorno)
- [Metodología aplicada](#metodología-aplicada)
- [Mejoras propuestas](#mejoras-propuestas)

---

## Stack de testing

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| [Vitest](https://vitest.dev) | 4.x | Test runner y assertions |
| [@testing-library/react](https://testing-library.com/react) | 16.x | Render de componentes React |
| [@testing-library/user-event](https://testing-library.com/user-event) | 14.x | Simulación de interacciones del usuario |
| [@testing-library/jest-dom](https://testing-library.com/jest-dom) | 6.x | Matchers adicionales para el DOM |
| jsdom | 29.x | Simulación del DOM en Node.js |

---

## Estructura y convenciones

Los tests se colocan **junto al archivo que testean** (colocación):

```
src/
├── lib/
│   ├── validations.ts
│   └── validations.test.ts       ← test unitario
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       └── LoginForm.test.tsx    ← test de componente
└── test/
    ├── setup.ts                  ← setup global (jest-dom)
    └── vitest.d.ts               ← tipos globales de Vitest
```

**Reglas de nombrado:**

- Tests unitarios: `*.test.ts`
- Tests de componentes: `*.test.tsx`
- Helpers y fixtures compartidos: `src/test/*.ts`

---

## Correr tests

```bash
# Modo watch — re-corre al guardar (desarrollo)
pnpm test

# Una sola pasada — CI y verificación no interactiva
pnpm exec vitest run

# Con cobertura
pnpm test:coverage
```

`pnpm test` inicia Vitest en modo watch. La ejecución no interactiva debe usar `pnpm exec vitest run`. La configuración actual tiene `passWithNoTests: true`: por lo tanto, una ejecución exitosa sin tests detectados no demuestra cobertura ni que existan pruebas para la funcionalidad. Para filtrar por archivo o nombre de test:

```bash
pnpm exec vitest run src/lib/validations.test.ts
pnpm exec vitest run --reporter=verbose
```

### Tests de integración (PostgreSQL real)

```bash
# Requiere Docker en marcha. Levanta postgres:17-alpine con Testcontainers, aplica las migraciones y ejecuta *.integration.test.ts
pnpm test:integration
```

- `pnpm exec vitest run` ejecuta solo el proyecto `unit` y **no** necesita Docker. El proyecto `integration` solo se registra con `--project integration`.
- Con `TEST_DATABASE_URL` definida se usa esa base en lugar de crear un contenedor.
- **Salvaguarda:** la suite lee únicamente `TEST_DATABASE_URL` (o el contenedor), nunca `DATABASE_URL` ni `DIRECT_URL` ni `.env`. Aborta si el host no es `localhost`/`127.0.0.1` o si el nombre de la base no contiene `test`, porque cada test trunca las tablas.
- La suite de contrato `describeHabitRepositoryContract` (`src/features/habits/application/habit-repository.contract.ts`) corre contra `InMemoryHabitRepository` y contra el adaptador de Prisma. Un repositorio nuevo debe pasarla.
- Decisión y plan: ADR-06 (`docs/architecture/decisions/`).

---

## Tests E2E con Playwright

Pruebas de navegador (Chromium) sobre la aplicación real: registro, crear/marcar/editar/eliminar hábitos, detalle y comprobaciones de layout a 375 px y 1280 px. Decisión: [ADR-07](../architecture/decisions/ADR-07-tests-e2e-con-playwright.md).

```bash
# Una vez: descarga Chromium (cache de Playwright; no se instalan otros navegadores)
pnpm exec playwright install chromium

# Requiere Docker en marcha. Tarda ~30 s: contenedor + build + 7 tests
pnpm test:e2e
```

- `e2e/global-setup.ts` arranca un PostgreSQL con Testcontainers (reutiliza `src/test/integration/` y `assertSafeTestDatabase`), aplica las migraciones, ejecuta `next build` y `next start` en el puerto 3100, y solo entonces corren los tests. Al terminar detiene el servidor y el contenedor.
- **Aislamiento:** `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (aleatorio), `AUTH_URL` y `APP_ORIGIN` se pasan explícitamente al servidor; `.env` no puede aportar ninguno. Cada test registra su propio usuario por la interfaz.
- Los hábitos de prueba se programan los siete días para que "hoy" siempre esté programado, sea cual sea la fecha.
- `next build` escribe en `.next`: no lo ejecutes con `next dev` activo.
- Las capturas de pantalla completa (`dashboard-1280.png`, `edit-mode-375.png`, `delete-dialog-*.png`, `detail-*.png`…) se guardan en `e2e/screenshots/` para revisar a mano contra el mockup; no hay aserciones de snapshot. Esa carpeta, `test-results/`, `playwright-report/` y `blob-report/` están en `.gitignore`.
- Vitest nunca recoge `e2e/` (excluido en `vitest.config.mts`). Todavía no corre en el CI (bloqueo de facturación de GitHub).

---

## Tests unitarios

Para funciones puras (validaciones, helpers, lógica de negocio).

**Ejemplo: `src/lib/validations.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './validations'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'no-es-un-email',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })
})
```

> Con `globals: true` en la config, `describe`, `it` y `expect` están disponibles globalmente sin import. El import explícito también funciona y es preferible para claridad.

---

## Tests de componentes

Para componentes React (Client Components). Los Server Components requieren mocking adicional — documentar cuando corresponda.

**Ejemplo: `src/components/auth/LoginForm.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('muestra los campos de email y password', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('deshabilita el botón mientras envía', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Matchers de jest-dom disponibles:**

| Matcher | Qué verifica |
|---------|-------------|
| `toBeInTheDocument()` | El elemento existe en el DOM |
| `toBeVisible()` | El elemento es visible |
| `toBeDisabled()` | El elemento está deshabilitado |
| `toHaveValue(val)` | El input tiene ese valor |
| `toHaveTextContent(text)` | El elemento contiene ese texto |
| `toHaveClass(cls)` | El elemento tiene esa clase CSS |

---

## Cobertura

```bash
pnpm test:coverage
```

Genera un reporte en `coverage/` (HTML navegable) y en consola.

**Exclusiones configuradas** (`vitest.config.mts`):

- `src/generated/**` — cliente de Prisma (auto-generado)
- `src/types/**` — solo definiciones de tipos
- `**/*.d.ts` — archivos de declaración

---

## Setup del entorno

**`vitest.config.mts`** — configuración principal:

```typescript
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',   // simula el DOM
    globals: true,           // test/expect/describe disponibles sin import
    passWithNoTests: true,   // permite éxito sin tests; el éxito no demuestra cobertura
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**`src/test/setup.ts`** — corre antes de cada test suite:

```typescript
import '@testing-library/jest-dom'
// Extiende expect() con matchers del DOM: toBeInTheDocument(), toBeVisible(), etc.
```

**`src/test/vitest.d.ts`** — tipos TypeScript para los globals:

```typescript
/// <reference types="vitest/globals" />
// Habilita autocompletado de test/describe/expect sin importarlos
```


---

## Metodología aplicada

- **Test-first:** cada comportamiento nuevo empieza con un test que falla (RED), luego la implementación mínima (GREEN) y después el refactor. Cada test verifica todos los efectos observables de la regla: estado HTTP, mensaje exacto y que lo rechazado no escriba datos.
- **Regresión:** por cada comportamiento existente que el cambio toca, un test que demuestra que sigue igual.
- **Tres capas, todas en Vitest:**
  1. Dominio y aplicación: funciones puras y `InMemoryHabitRepository`.
  2. Rutas de API (`tests/*-route.test.ts`): se invoca el handler con `prisma` y `auth` mockeados y se comprueba el contrato (códigos, mensajes, 404 uniforme para recursos ajenos).
  3. Componentes de UI: Testing Library con `fetch` mockeado.
- **Guardas estáticas:** `tsc`, `eslint` (tokens de diseño `--hm-*` y fronteras de ADR-05) y `build`, además del CI de `.github/workflows/ci.yml`.
- **Límites conocidos:** las pruebas de integración cubren el repositorio contra PostgreSQL real y las E2E (Playwright) los flujos principales en Chromium, pero no hay umbral de cobertura ni E2E en el CI. jsdom no mide layout; lo visual se revisa con las capturas de las E2E.

---

## Mejoras propuestas

Ordenadas por relación entre valor y costo. Ninguna está implementada.

| # | Mejora | Estado |
|---|--------|--------|
| 1 | Tests de integración del repositorio contra PostgreSQL real | Plan en [ADR-06](../architecture/decisions/ADR-06-tests-de-integracion-con-postgres.md) (aceptado, en implementación) |
| 2 | Suite de contrato compartida entre `InMemoryHabitRepository` y el adaptador de Prisma | Incluida en ADR-06 |
| 3 | E2E con Playwright de pocos flujos críticos (registro → login → crear hábito → marcarlo → logout): cubre cookies de sesión, redirecciones, layout y responsive | Implementado como `pnpm test:e2e` ([ADR-07](../architecture/decisions/ADR-07-tests-e2e-con-playwright.md)); falta el job de CI |
| 4 | Umbral de cobertura en CI solo para `src/features/**` (objetivo realista, p. ej. 80 %) | Pendiente |
| 5 | Higiene: corregir el warning de `eslint.config.mjs` (`import/no-anonymous-default-export`), mover los tests de `tests/` junto a su ruta y ejecutar los tests en `pre-push` | Pendiente |

Las mejoras 1–3 y 5 cambian tooling o dependencias: requieren aprobación explícita antes de implementarse.
