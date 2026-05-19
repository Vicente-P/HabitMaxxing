# Guía de deploy — Vercel

> ⚠️ **Documento en construcción.** El deploy a Vercel está pendiente de implementación.
> Este documento se completará cuando el proyecto esté listo para producción (fin de Fase 1).

---

## Stack de deploy planeado

| Servicio | Rol |
|---------|-----|
| Vercel | Hosting del frontend y API (Next.js serverless) |
| Supabase | Base de datos PostgreSQL en producción |

---

## Variables de entorno en Vercel

Las siguientes variables deben configurarse en el dashboard de Vercel antes del primer deploy:

| Variable | Descripción |
|---------|-------------|
| `DATABASE_URL` | URL del Session Pooler de Supabase (producción) |
| `AUTH_SECRET` | String aleatorio seguro para Auth.js |
| `NEXTAUTH_URL` | URL pública de la app en producción |

---

## Checklist de pre-deploy

- [ ] Todas las migraciones aplicadas en la base de datos de producción
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build de producción sin errores (`pnpm build`)
- [ ] Rutas protegidas verificadas manualmente
- [ ] EP-01 (autenticación) completamente implementado y testeado

---

*Este documento se actualizará con instrucciones paso a paso al momento de hacer el primer deploy.*
