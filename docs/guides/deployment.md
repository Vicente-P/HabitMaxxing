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
| `DATABASE_URL` | Connection string del Session Pooler de Supabase | `postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres` |
| `AUTH_SECRET` | String aleatorio seguro para Auth.js v5 | `openssl rand -base64 32` |
| `AUTH_URL` | URL pública de la app en producción | `https://habitmaxxing.vercel.app` |

> `AUTH_SECRET` y `AUTH_URL` son los nombres canónicos de Auth.js v5. No usar `NEXTAUTH_SECRET` ni `NEXTAUTH_URL`.

---

## Primer deploy

1. Conectar el repositorio en [vercel.com/new](https://vercel.com/new)
2. Configurar las tres variables de entorno de la tabla anterior
3. Vercel detecta Next.js automáticamente — no hace falta cambiar el framework ni el build command
4. Hacer click en **Deploy**

Vercel corre `pnpm install` + `pnpm build`. El script `build` incluye `prisma generate` para garantizar que el cliente de Prisma esté disponible.

---

## Checklist de pre-deploy

- [ ] Repositorio conectado a Vercel
- [ ] `DATABASE_URL` configurado en Vercel (Session Pooler de Supabase, puerto 6543)
- [ ] `AUTH_SECRET` generado y configurado en Vercel
- [ ] `AUTH_URL` configurado con la URL de producción
- [ ] Migraciones aplicadas en la base de datos de producción (`pnpm prisma migrate deploy`)
- [ ] Build de producción sin errores (`pnpm build`)
- [ ] CI en verde antes de mergear a `main`
