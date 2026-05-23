# HabitMaxxing

Aplicación web para trackear hábitos diarios. Permite registrar hábitos binarios o numéricos, visualizar el progreso con un calendario heatmap, mantener rachas de cumplimiento y consultar estadísticas mensuales.

El proyecto cubre el ciclo completo de desarrollo de software — requisitos, backlog, diseño, implementación, CI/CD y deploy — como ejercicio de aprendizaje.

## Características

| Área | Descripción |
|------|-------------|
| Autenticación | Registro e inicio de sesión con Auth.js v5 y contraseñas hasheadas con bcrypt |
| Hábitos | CRUD de hábitos binarios o numéricos, con frecuencia semanal configurable |
| Registro diario | Un log por hábito por día, con valor opcional para hábitos numéricos |
| Progreso | Rachas, heatmap y estadísticas mensuales *(en desarrollo)* |
| API REST | Route Handlers de Next.js con validación Zod y respuestas tipadas |

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19 + [Tailwind CSS 4](https://tailwindcss.com) |
| ORM | [Prisma 7](https://www.prisma.io) |
| Base de datos | PostgreSQL ([Supabase](https://supabase.com)) |
| Autenticación | [Auth.js v5](https://authjs.dev) (NextAuth) |
| Validación | [Zod 4](https://zod.dev) |
| Package manager | [pnpm 11](https://pnpm.io) |
| Deploy | [Vercel](https://vercel.com) |
| CI | GitHub Actions + Husky |

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| [Node.js](https://nodejs.org) | 22.x |
| [pnpm](https://pnpm.io) | 11.x |
| [Git](https://git-scm.com) | — |

> pnpm 11 requiere Node.js 22 como mínimo.

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/Vicente-P/HabitMaxxing.git
cd HabitMaxxing
pnpm install
```

`pnpm install` genera el cliente de Prisma (vía `postinstall`) y activa los hooks de Husky (vía `prepare`).

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Supabase Session Pooler — queries y migraciones (puerto 5432)
DATABASE_URL="postgresql://postgres.[project-ref]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Auth.js v5
AUTH_SECRET="tu-secret-aqui"
AUTH_URL="http://localhost:3000"
```

Para obtener `DATABASE_URL`, andá a **Supabase → Settings → Database → Connection String** y copiá la URL del **Session Pooler**.

Para generar `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

> [!IMPORTANT]
> Usá el **Session Pooler** (puerto **5432**) para desarrollo y migraciones. El Transaction Pooler (puerto 6543) no soporta operaciones DDL como `migrate dev`.

> [!NOTE]
> Auth.js v5 usa `AUTH_SECRET` y `AUTH_URL`. No uses `NEXTAUTH_SECRET` ni `NEXTAUTH_URL`.

### 3. Aplicar migraciones

```bash
pnpm dlx prisma migrate dev
```

### 4. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

Para una guía detallada con troubleshooting, consultá [`docs/guides/setup.md`](docs/guides/setup.md).

## Estructura del proyecto

```
habitmaxxing/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/   # Handler de Auth.js
│   │   ├── (auth)/                   # Login y registro
│   │   ├── (dashboard)/              # Rutas protegidas
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── auth/
│   ├── generated/prisma/             # Cliente generado por Prisma
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── validations.ts
│   ├── hooks/
│   ├── test/                         # Setup global de tests
│   │   ├── setup.ts                  # Importa @testing-library/jest-dom
│   │   └── vitest.d.ts               # Tipos globales de Vitest
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── prisma.config.ts
├── vitest.config.mts                 # Configuración de Vitest
├── docs/                             # Documentación del proyecto
└── .github/workflows/ci.yml
```

## Modelos de base de datos

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios registrados |
| `Habit` | Hábitos del usuario (tipo `BINARY` o `NUMERIC`, frecuencia semanal) |
| `HabitLog` | Registro diario por hábito (único por fecha) |

Ver el diagrama completo en [`docs/architecture/database.md`](docs/architecture/database.md).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Genera Prisma Client y compila para producción |
| `pnpm start` | Servidor de producción |
| `pnpm test` | Tests en modo watch (Vitest) |
| `pnpm test:coverage` | Tests con reporte de cobertura |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificación de tipos (`tsc --noEmit`) |
| `pnpm dlx prisma studio` | GUI para explorar la base de datos |
| `pnpm dlx prisma migrate dev` | Ejecuta migraciones en desarrollo |
| `pnpm dlx prisma migrate deploy` | Aplica migraciones en producción |

## CI/CD

El pipeline de CI corre en GitHub Actions ante push a `feature/**`/`develop` y PRs a `develop`/`main`:

```
lint-staged (pre-commit) → typecheck (pre-push) → CI (validate → generate → typecheck → lint → test → build)
```

El deploy a producción lo gestiona la integración nativa de Vercel al mergear a `main`.

| Documento | Contenido |
|-----------|-----------|
| [`docs/guides/ci-cd.md`](docs/guides/ci-cd.md) | Pipeline de CI, hooks de Husky y secrets |
| [`docs/guides/deployment.md`](docs/guides/deployment.md) | Deploy en Vercel y variables de entorno |

## Documentación

La carpeta [`docs/`](docs/) contiene la documentación completa del proyecto:

| Sección | Descripción |
|---------|-------------|
| [`docs/architecture/`](docs/architecture/) | Visión general, base de datos, flujo de auth y ADRs |
| [`docs/api/`](docs/api/) | Endpoints REST y contratos de respuesta |
| [`docs/guides/`](docs/guides/) | Setup, deploy, CI/CD y contribución |
| [`docs/wiki/`](docs/wiki/) | Requisitos, backlog y Gitflow del proyecto |

## Flujo de trabajo Git

El proyecto usa **Gitflow**:

```
feature/SCRUM-N-descripcion → develop → release/* → main
```

| Rama | Propósito |
|------|-----------|
| `main` | Código en producción |
| `develop` | Integración de features |
| `feature/*` | Una rama por historia de usuario |
| `release/*` | Preparación de versión |
| `hotfix/*` | Correcciones urgentes |

Convención de commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `chore`, etc.).

Ver [`docs/guides/contributing.md`](docs/guides/contributing.md) para el flujo completo de PRs.

## Roadmap

| Fase | Contenido | Estado |
|------|-----------|--------|
| **Fase 1 — MVP** | Auth, CRUD hábitos, registro diario, rachas, heatmap | En desarrollo |
| **Fase 2** | Recordatorios por email, puntos y recompensas | Pendiente |
| **Fase 3** | Funciones sociales (amigos, logros compartidos) | Pendiente |

| Épica | Estado |
|-------|--------|
| EP-01 — Autenticación y gestión de cuenta | En desarrollo |
| EP-02 — Gestión de hábitos (CRUD) | Pendiente |
| EP-03 — Registro diario | Pendiente |
| EP-04 — Progreso y estadísticas | Pendiente |
| EP-05 — UI/UX responsive y modo oscuro | Pendiente |

## Gestión del proyecto

- **Jira:** [vperezc18.atlassian.net/browse/SCRUM](https://vperezc18.atlassian.net/browse/SCRUM)
- **Metodología:** Scrum con sprints de 2 semanas (máx. 8 SP por sprint)
