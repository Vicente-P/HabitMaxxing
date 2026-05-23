# SPEC_CONVENTIONS — Habit Maxxing

> Source of truth para convenciones técnicas del proyecto. Todas las specs en `docs/specs/` deben ser coherentes con este documento.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 22.x | Runtime |
| pnpm | 11.1.3 | Package manager |
| Next.js | 16.2.6 | Framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Lenguaje |
| Tailwind CSS | 4.x | Estilos |
| Prisma | 7.8.0 | ORM |
| PostgreSQL | — | Base de datos (Supabase) |
| Auth.js (next-auth) | 5.0.0-beta.29 | Autenticación |
| Zod | 4.4.3 | Validación |
| bcryptjs | 3.0.3 | Hash de contraseñas (saltRounds: 12) |
| ESLint | 9.x | Linting |
| Husky + lint-staged | 9.x / 17.x | Git hooks |
| Vercel | — | Deploy |

### Base de datos (Supabase)

| Pooler | Puerto | Uso |
|--------|--------|-----|
| Session Pooler | 5432 | Desarrollo, migraciones, DDL |
| Transaction Pooler | 6543 | Queries en producción (sin DDL) |

Variables de entorno requeridas:

```env
DATABASE_URL="postgresql://..."   # Session Pooler en dev
AUTH_SECRET="..."                 # openssl rand -base64 32
AUTH_URL="http://localhost:3000"  # URL base de la app
```

---

## URL base de la API

```
Desarrollo:  http://localhost:3000/api
Producción:  https://[dominio-vercel].vercel.app/api
```

Patrón de rutas: `/api/[recurso]/[id?]/[acción?]`

---

## Formato estándar de respuestas API

### Éxito (2xx)

```json
{
  "data": { }
}
```

Para listas paginadas (futuro):

```json
{
  "data": [ ],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

### Error de validación (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email es inválido"
      }
    ]
  }
}
```

### Error genérico (4xx / 5xx)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Debes iniciar sesión para acceder a este recurso"
  }
}
```

---

## Códigos de error globales

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos (Zod) |
| `UNAUTHORIZED` | 401 | Sin sesión activa o sesión expirada |
| `FORBIDDEN` | 403 | Autenticado pero sin permiso sobre el recurso |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Conflicto (ej. email duplicado, log duplicado) |
| `ACCOUNT_LOCKED` | 429 | Cuenta bloqueada tras intentos fallidos de login |
| `TOKEN_EXPIRED` | 400 | Token de recuperación de contraseña expirado |
| `INTERNAL_ERROR` | 500 | Error interno no recuperable |

---

## Convenciones de código

### TypeScript y async/await

- Usar `async/await` en lugar de `.then()/.catch()`.
- Tipar respuestas de API con interfaces en `src/types/`.
- Preferir `const` sobre `let`; evitar `var`.

### Validación con Zod

- Schemas centralizados en `src/lib/validations.ts`.
- Validar siempre en el boundary (Route Handler) antes de acceder a la DB.
- Mensajes de error en español, orientados al usuario.

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("El email es inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().optional(),
});
```

### Route Handlers (Next.js App Router)

- Ubicación: `src/app/api/[recurso]/route.ts`.
- Exportar funciones nombradas por método HTTP: `GET`, `POST`, `PATCH`, `DELETE`.
- Obtener sesión con `auth()` de Auth.js antes de operaciones protegidas.
- Nunca exponer `password` ni hashes en respuestas.

### Prisma

- Cliente generado en `src/generated/prisma`.
- Singleton en `src/lib/prisma.ts`.
- Usar transacciones solo cuando haya múltiples operaciones dependientes.
- IDs generados con `@default(cuid())`.

### Fechas e IDs

| Tipo | Formato |
|------|---------|
| IDs | `cuid()` — string opaco |
| Fechas en API | ISO 8601 (`2026-05-22T00:00:00.000Z`) |
| Fechas en DB (HabitLog.date) | `@db.Date` — solo fecha, sin hora |

### Días de la semana (`frequency`)

Array de enteros `0–6`:

| Valor | Día |
|-------|-----|
| 0 | Domingo |
| 1 | Lunes |
| 2 | Martes |
| 3 | Miércoles |
| 4 | Jueves |
| 5 | Viernes |
| 6 | Sábado |

---

## Convenciones de base de datos

### Modelos

| Modelo | Tabla Prisma | Descripción |
|--------|--------------|-------------|
| User | `User` | Usuario registrado |
| Habit | `Habit` | Hábito del usuario |
| HabitLog | `HabitLog` | Registro diario por hábito |

Ver specs detalladas en [`models/`](./models/).

### Reglas de integridad

- `User.email` es único.
- `HabitLog` tiene constraint `@@unique([habitId, date])` — un registro por hábito por día.
- Eliminación en cascada: borrar `User` → borra `Habit` → borra `HabitLog`.
- `Habit.unit` es obligatorio cuando `type = NUMERIC`, nulo cuando `type = BINARY`.

### Reglas de negocio (cálculos)

- **Racha:** se calcula solo sobre días programados en `frequency`. Los días no programados no rompen ni suman a la racha.
- **Porcentaje de cumplimiento:** `(días completados / días programados transcurridos) × 100` en el mes consultado. Solo cuenta días programados que ya pasaron.

---

## Convenciones de autenticación y seguridad

### Auth.js v5

- Handler: `src/app/api/auth/[...nextauth]/route.ts`.
- Configuración: `src/lib/auth.ts`.
- Estrategia: **sesiones basadas en cookies** (no Bearer tokens).
- Variables: `AUTH_SECRET`, `AUTH_URL` (no usar `NEXTAUTH_*`).

### Endpoints públicos vs protegidos

| Público | Protegido |
|---------|-----------|
| `POST /api/auth/register` | Todos los demás endpoints |
| Login vía Auth.js (`signIn`) | |

### Seguridad

- Contraseñas hasheadas con bcryptjs (saltRounds: 12).
- **Nunca** retornar `password` en respuestas API.
- Mensaje genérico en login fallido: "Credenciales incorrectas" (no revelar si el email existe).
- Bloqueo temporal tras 5 intentos fallidos consecutivos (15 minutos).
- Tokens de recuperación de contraseña expiran en 30 minutos.
- Verificar ownership: un usuario solo accede a sus propios `Habit` y `HabitLog`.

---

## Convenciones de nombrado

### Archivos y carpetas

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Route Handlers | `route.ts` en carpeta del recurso | `src/app/api/habits/route.ts` |
| Componentes React | PascalCase | `HabitCard.tsx` |
| Hooks | camelCase con prefijo `use` | `useHabits.ts` |
| Utilidades/lib | camelCase | `validations.ts` |
| Tipos | PascalCase en `src/types/` | `Habit`, `ApiResponse` |
| Specs | kebab-case | `forgot-password.md` |

### Ramas (Gitflow)

```
main          → producción
develop       → integración
feature/*     → feature/SCRUM-N-descripcion-corta
release/*     → preparación de versión
hotfix/*      → correcciones urgentes en producción
```

### Commits (Conventional Commits)

```
feat(auth): add register endpoint
fix(habits): validate frequency array is not empty
docs(specs): add habit model specification
test(logs): add binary toggle tests
chore(deps): bump prisma to 7.8.0
```

Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`.

---

## Metodología de proyecto

| Aspecto | Valor |
|---------|-------|
| Metodología | Scrum, sprints de 2 semanas |
| Capacidad | Máx. 8 SP por sprint |
| Jira | [vperezc18.atlassian.net/browse/SCRUM](https://vperezc18.atlassian.net/browse/SCRUM) |
| Specs | `docs/specs/` es source of truth para implementación |

---

## Índice de specs

| Carpeta | Archivos | Épica Jira |
|---------|----------|------------|
| [`models/`](./models/) | user, habit, habit-log | — |
| [`auth/`](./auth/) | register, login, logout, forgot-password | SCRUM-1 / EP-01 |
| [`habits/`](./habits/) | create, update, delete, list | SCRUM-2 / EP-02 |
| [`logs/`](./logs/) | create, stats | SCRUM-3 / EP-03, SCRUM-4 / EP-04 |
