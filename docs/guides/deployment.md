# Guía de deploy — Vercel

## Stack de deploy

| Servicio | Rol |
|---------|-----|
| Vercel | Hosting del frontend y API (Next.js serverless) |
| Supabase | Base de datos PostgreSQL en producción |

El deploy es automático: cada push a `main` dispara un deploy en Vercel vía integración nativa de GitHub. No requiere configuración adicional de GitHub Actions.

Para más detalle sobre el pipeline completo, ver [CI/CD](./ci-cd.md).

---

## Variables de entorno en Vercel

Configurar en **Vercel → Project → Settings → Environment Variables**:

| Variable | Descripción | Ejemplo |
|---------|-------------|---------|
| `DATABASE_URL` | Transaction Pooler de Supabase para Prisma Client en runtime serverless; puerto 6543 y `?pgbouncer=true` | `postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Conexión directa o Session Pooler de Supabase (puerto 5432), exclusiva para Prisma CLI y migraciones | `postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` |
| `AUTH_SECRET` | String aleatorio seguro para Auth.js v5 | `openssl rand -base64 32` |
| `AUTH_URL` | URL pública de la app en producción | `https://habit-maxxing.vercel.app` |
| `APP_ORIGIN` | Origen confiable exclusivo de este despliegue para crear hábitos | `https://habit-maxxing.vercel.app` |

> `AUTH_SECRET` y `AUTH_URL` son los nombres canónicos de Auth.js v5. No usar `NEXTAUTH_SECRET` ni `NEXTAUTH_URL`.

---

## Primer deploy

1. Conectar el repositorio en [vercel.com/new](https://vercel.com/new)
2. Configurar las variables de entorno de la tabla anterior
3. Vercel detecta Next.js automáticamente — no hace falta cambiar el framework ni el build command
4. Hacer click en **Deploy**

Vercel corre `pnpm install` + `pnpm build`. El script `build` incluye `prisma generate` para garantizar que el cliente de Prisma esté disponible.

---

## Origen confiable para crear hábitos

`APP_ORIGIN` es configuración exclusiva del servidor; no usar prefijo `NEXT_PUBLIC_`. Configurar un único origen exacto por despliegue:

- Desarrollo: `http://localhost:3000` (actualizar si cambia el puerto). HTTP solo se admite para localhost/loopback explícito.
- Producción: `https://habit-maxxing.vercel.app`.
- Cada preview: su propia URL HTTPS exacta, configurada explícitamente. No usar `*.vercel.app` ni confiar automáticamente en otros despliegues.

El valor debe ser un origen sin credenciales, ruta adicional, query ni fragmento; se admite la barra final canónica `/`. `APP_ORIGIN` ausente o inválido hace que la creación autenticada falle cerrada con 500 neutral. No se obtiene de `Host`, cabeceras reenviadas ni metadata de preview no verificada.

La configuración de cada preview es un prerrequisito operativo pendiente: esta unidad no modifica Vercel ni automatiza configuración remota. No modificar una configuración publicada sin autorización. Validar previews/producción con cuentas reales también requiere autorización independiente.

## Checklist de pre-deploy

- [ ] Repositorio conectado a Vercel
- [ ] `APP_ORIGIN` configurado explícitamente para producción y cada preview habilitada
- [ ] `DATABASE_URL` configurado en Vercel (Transaction Pooler de Supabase, puerto 6543, con `?pgbouncer=true`)
- [ ] `DIRECT_URL` configurado para Prisma CLI y migraciones (conexión directa o Session Pooler, puerto 5432)
- [ ] `AUTH_SECRET` generado y configurado en Vercel
- [ ] `AUTH_URL` configurado con la URL de producción
- [ ] Migraciones aplicadas en la base de datos de producción (`pnpm prisma migrate deploy`)
- [ ] Build de producción sin errores (`pnpm build`)
- [ ] CI en verde antes de mergear a `main`

> Mientras el CI de GitHub no pueda ejecutarse (bloqueo de facturación de la cuenta), el ítem "CI en verde" se reemplaza por la corrida local completa sobre la rama a publicar: `pnpm install --frozen-lockfile`, `pnpm prisma validate`, `pnpm typecheck`, `pnpm lint`, `pnpm exec vitest run`, `pnpm test:integration`, `pnpm test:e2e` y `pnpm build`.

---

## Release de `develop` a `main`

- Publicar con un PR titulado `chore(release): promote develop to main` y mergearlo con **merge commit, nunca con squash**. Un squash crea en `main` un commit con el mismo contenido que uno de `develop` pero fuera de su historia, y el siguiente release choca en todos los archivos que cambiaron desde entonces.
- Si `develop` → `main` muestra conflictos, comprobar primero si `main` contiene algo que `develop` no tenga. Si el árbol de `main` coincide con un commit de `develop` (`git rev-parse origin/main^{tree}` contra `git log origin/develop --format='%H %T'`), crear una rama `release/<fecha>` desde `develop`, ejecutar `git merge -s ours origin/main`, verificar que su árbol sea idéntico al de `develop` y abrir el PR desde esa rama. Así se hizo el release del 2026-11-06 (PR #47).
- Revisar si hay migraciones nuevas (`git diff --stat origin/main origin/develop -- prisma/`); si las hay, aplicarlas en producción antes de mergear.

---

## Verificación post-deploy

El estado "success" del deploy en GitHub no garantiza que el dominio público sirva ese deploy. Después de cada release:

1. Confirmar qué deploy sirve el dominio: `vercel inspect habit-maxxing.vercel.app --scope vicente-ps-projects` (el `url` y el `created` deben corresponder al deploy recién creado). Un header `Age` muy alto en `curl -sI https://habit-maxxing.vercel.app/login` también delata una versión vieja.
2. Si el dominio sigue en un deploy anterior, la asignación automática del dominio de producción está pausada (pasa después de un Instant Rollback o de una promoción manual). Promover el deploy nuevo: `vercel promote <url-del-deploy> --scope vicente-ps-projects --yes`. Esto también reactiva la asignación automática.
3. Smoke test sin crear datos: `/login` responde 200, `/dashboard` y `/habits` redirigen a `/login` sin sesión, y `GET /api/habits` responde 401 con JSON `UNAUTHORIZED`.
4. Las URLs propias de cada deploy están detrás de Deployment Protection (login de Vercel); el smoke test se hace contra el dominio público.
