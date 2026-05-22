# CI/CD — GitHub Actions + Vercel

## Tabla de contenidos

- [Visión general](#visión-general)
- [Pipeline de CI](#pipeline-de-ci)
- [Deploy con Vercel](#deploy-con-vercel)
- [Hooks locales](#hooks-locales)
- [GitHub Secrets](#github-secrets)
- [Troubleshooting](#troubleshooting)

---

## Visión general

```
feature/SCRUM-N → push/PR a develop
                        ↓
                   CI (GitHub Actions)
                   lint → typecheck → build
                        ↓ (si pasa)
develop → merge a main
                        ↓
              Deploy automático (Vercel)
```

---

## Pipeline de CI

**Archivo:** `.github/workflows/ci.yml`

### Triggers

| Evento | Rama |
|--------|------|
| `push` | `develop`, `feature/**` |
| `pull_request` | `develop`, `main` |

### Steps en orden

| # | Step | Comando |
|---|------|---------|
| 1 | Instalar dependencias | `pnpm install --frozen-lockfile` |
| 2 | Validar schema de Prisma | `pnpm prisma validate` |
| 3 | Generar cliente de Prisma | `pnpm prisma generate` |
| 4 | Typecheck | `pnpm typecheck` |
| 5 | Lint | `pnpm lint` |
| 6 | Tests | `pnpm run --if-present test` |
| 7 | Build | `pnpm build` |

> El paso 3 (`prisma generate`) debe ejecutarse **antes** del typecheck — el cliente generado vive en `src/generated/prisma/` y TypeScript lo necesita para resolver los tipos.

### Entorno

- **Runner:** `ubuntu-latest`
- **Node.js:** 22 (mínimo requerido por pnpm 11)
- **pnpm:** 11.1.3 (definido en `packageManager` de `package.json`)

---

## Deploy con Vercel

El deploy a producción lo maneja la integración nativa de Vercel — no requiere un workflow adicional en GitHub Actions.

| Evento | Resultado |
|--------|-----------|
| Push a `main` | Deploy a producción |
| Push a cualquier otra rama | Preview deploy (configurable) |

### Build en Vercel

El script `build` de `package.json` corre `prisma generate` antes de `next build`:

```json
"build": "prisma generate && next build"
```

Esto garantiza que el cliente de Prisma siempre esté generado en Vercel, independientemente del caché de `node_modules`.

---

## Hooks locales

Husky ejecuta validaciones **antes de que git permita el commit o el push**:

### `pre-commit` — lint-staged

Corre ESLint solo sobre los archivos `.ts` y `.tsx` que están staged. Si hay errores, el commit se cancela.

```bash
# Lo que corre internamente:
pnpm lint-staged
# → eslint --fix sobre archivos staged *.{ts,tsx}
```

### `pre-push` — typecheck

Corre `tsc --noEmit` sobre el proyecto completo antes de cada push. Si hay errores de tipos, el push se cancela.

```bash
# Lo que corre internamente:
pnpm typecheck
# → tsc --noEmit
```

> Los hooks se activan automáticamente al correr `pnpm install` — no hace falta configuración manual.

---

## GitHub Secrets

Configurar en **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Descripción | Requerido para |
|--------|-------------|----------------|
| `DATABASE_URL` | Connection string de Supabase | Build (next build) |
| `AUTH_SECRET` | String aleatorio para Auth.js | Build |
| `AUTH_URL` | URL base de la app en producción | Build |

Si un secret no está configurado, el workflow usa un valor placeholder que permite que `prisma generate` y el typecheck pasen igualmente (no conectan a la DB).

### Generar `AUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## Troubleshooting

### `ERR_PNPM_IGNORED_BUILDS`

Los build scripts de `@prisma/engines` están bloqueados. Verificar que `pnpm-workspace.yaml` tenga:

```yaml
allowBuilds:
  '@prisma/engines': true
  prisma: true
```

### `Cannot find module '@/generated/prisma'`

El cliente de Prisma no fue generado antes del build. Verificar que el script `build` en `package.json` sea:

```json
"build": "prisma generate && next build"
```

### `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`

La variable `DATABASE_URL` no está disponible al momento de correr `prisma generate`. Verificar que el secret esté configurado en GitHub o que el workflow tenga un fallback.

### Los hooks de Husky no corren

Husky necesita que git conozca la carpeta `.husky/`. Correr:

```bash
pnpm install
```

Si sigue sin funcionar:

```bash
pnpm exec husky
```
