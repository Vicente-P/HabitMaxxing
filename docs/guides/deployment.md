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
