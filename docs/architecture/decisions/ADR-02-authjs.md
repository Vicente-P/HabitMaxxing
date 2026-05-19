# ADR-02 — Autenticación: Auth.js v5

## Estado

Aceptado

---

## Contexto

La aplicación requiere un sistema de autenticación con registro mediante email/contraseña, manejo de sesiones y protección de rutas. El sistema debe integrarse nativamente con Next.js App Router sin introducir dependencias de terceros de pago.

---

## Decisión

Usar **Auth.js v5** (anteriormente NextAuth.js) con el provider de **Credentials** para autenticación por email y contraseña, y **bcryptjs** para el hash de contraseñas.

---

## Motivo

- **Integración nativa con Next.js:** Auth.js está diseñado específicamente para Next.js. El handler `[...nextauth]/route.ts` se integra directamente en el App Router sin configuración adicional.
- **Gratuito y open source:** Sin límites de usuarios ni costos adicionales.
- **Manejo de sesiones incluido:** JWT y session management out of the box.
- **Extensible:** Si en el futuro se quieren agregar providers OAuth (Google, GitHub), es una configuración de pocas líneas.
- **bcryptjs** (en lugar de bcrypt) no requiere compilación nativa — funciona en cualquier entorno incluyendo Vercel Edge Functions.

---

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|------------|---------------------|
| **Clerk** | Servicio de pago con free tier limitado; introduce dependencia de un tercero externo |
| **Supabase Auth** | Duplicaría la capa de autenticación con la de base de datos; Auth.js da más control |
| **Lucia Auth** | Menos documentación y comunidad más pequeña; mayor complejidad de implementación manual |
| **JWT custom** | Implementar rotación de tokens, invalidación y protección CSRF desde cero es propenso a errores de seguridad |

---

## Consecuencias

✅ Sin costo adicional, sin límites de usuarios.  
✅ Preparado para agregar OAuth providers en fases futuras.  
✅ Integración directa con Prisma via Prisma Adapter (si se necesita en el futuro).  
✅ bcryptjs funciona en entornos serverless sin compilación nativa.  
⚠️ Auth.js v5 está en beta — la API puede tener cambios breaking antes del release estable.  
⚠️ La documentación de v5 aún está incompleta en algunos casos edge.
