# Testing — Vitest + Testing Library

## Tabla de contenidos

- [Stack de testing](#stack-de-testing)
- [Estructura y convenciones](#estructura-y-convenciones)
- [Correr tests](#correr-tests)
- [Tests unitarios](#tests-unitarios)
- [Tests de componentes](#tests-de-componentes)
- [Cobertura](#cobertura)
- [Setup del entorno](#setup-del-entorno)

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

# Una sola pasada — útil para CI o verificación rápida
pnpm vitest run

# Con cobertura
pnpm test:coverage
```

Vitest abre una UI interactiva en modo watch. Para filtrar por archivo o nombre de test:

```bash
pnpm vitest run src/lib/validations.test.ts
pnpm vitest run --reporter=verbose
```

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
    passWithNoTests: true,   // no falla si no hay archivos de test (útil en CI)
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
