# Endpoint: Cierre de sesión

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-8](https://vperezc18.atlassian.net/browse/SCRUM-8) / HU-03 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 1 |
| **Autenticación** | Sesión para el flujo habitual; repetición/sin sesión usa semántica nativa |

## Descripción

Retira la cookie/sesión Auth.js de este navegador; no revoca JWT copiados ni sesiones de otros dispositivos (PM-01, aprobado 2026-10-07). Tras confirmar el cierre, redirige a `/login`; el guard servidor existente deniega nuevo acceso al dashboard sin autenticación.

**Estado 2026-10-07:** etapa logout/dashboard aceptada localmente con prueba real aislada sobre `201ce13` (fuente `689cbb8`); `/api/habits` sigue pendiente de HU-06 y la historia original completa no se acredita (PM-02).

> **Nota:** Auth.js gestiona el logout via `signOut()` en el cliente, que llama internamente a `POST /api/auth/signout`.

---

## Request

```
POST /api/auth/signout
```

Gestionado por el handler de Auth.js en `src/app/api/auth/[...nextauth]/route.ts`.

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| Cookie | Sesión Auth.js | Si existe |

Auth.js obtiene CSRF y envía un body `application/x-www-form-urlencoded` con `csrfToken` y `callbackUrl`, además de `X-Auth-Return-Redirect: 1`. El cliente no duplica esta lógica ni elimina cookies manualmente.

---

## Comportamiento esperado

El control utiliza `signOut({ redirect: false, redirectTo: "/login" })`; el helper procesa JSON y no redirige automáticamente. Que la promesa se resuelva no prueba éxito HTTP. `getSession()` puede devolver `null` ante errores de transporte, por lo que tampoco sirve como confirmación inequívoca.

## Comportamiento en frontend

1. Usuario presiona "Cerrar sesión".
2. Deshabilita el control mientras espera y llama al helper nativo sin redirección.
3. Comprueba `GET /api/auth/session` con credenciales del mismo origen, sin caché y rechazando redirecciones. Solo una respuesta HTTP exitosa, no redirigida y JSON explícitamente `null` permite continuar.
4. Navega a `/login` después de esa confirmación; llegar al login por sí solo no prueba que la sesión terminó.
5. Si no puede confirmar el cierre, muestra "No pudimos confirmar el cierre de sesión. Inténtalo de nuevo." y habilita reintento (PM-03).
6. El guard servidor HU-02 protege `/dashboard`; la aceptación aislada verificó cookie retirada, sesión nula y acceso protegido denegado.

---

## Criterios de aceptación (Jira)

- **CA-01:** Dado que estoy autenticado, cuando presiono "Cerrar sesión", entonces soy redirigido al login y mi sesión es invalidada.
- **CA-02:** Dado que cerré sesión, cuando intento acceder a una ruta protegida, entonces soy redirigido al login automáticamente.

---

## Tests requeridos

- [x] Logout con sesión activa retira la cookie de sesión de este navegador (prueba local aislada).
- [x] Tras logout, `GET /api/auth/session` retorna HTTP 200 y JSON `null` (local).
- [ ] Tras logout, acceso a `GET /api/habits` retorna 401: diferido explícitamente hasta HU-06; no completar la historia original con pruebas solo de dashboard.
- [x] Tras logout, navegación fresca/directa/Back a `/dashboard` deniega contenido y redirige a `/login` (HTTP 307, local).
- [x] Logout repetido/sin sesión activa: POST nativo 200, sesión nula, cookie ausente y dashboard denegado; sin imponer HTTP 401 ni destino de callback propio.
- [x] Confirmación 503: aviso neutral exacto, reintento habilitado y sin navegación de éxito; reintento por teclado confirma sesión nula. Pendiente/duplicados, Enter/Space y 320 px sin desbordamiento observados localmente.

Las pruebas deterministas usan mocks; se complementaron con tres intentos locales reales. Los primeros fallos fueron aserciones combinadas/callback y un localizador genérico de alertas; la prueba enfocada de recuperación terminó con exit 0. El origen del callback repetido sigue desconocido, sin afirmar un defecto de código o seguridad. Cookie local HttpOnly/SameSite=Lax persistente; Secure=false en HTTP no acredita producción. Contenedores/volúmenes y procesos detenidos; limpieza de temporales bloqueada por política queda como seguimiento no bloqueante. No aprobación de seguridad ni revocación global.

---

## Notas de implementación

- Usar `signOut()` de `next-auth/react` en componentes cliente.
- Reutilizar `auth()` en el Server Component de dashboard, propiedad de HU-02; no crear middleware, Proxy ni endpoint `/api/auth/logout` adicional.
- Auth.js es responsable de CSRF/cookies y la sesión nativa; no implementar revocación global ni tokens paralelos.

## Notas de seguridad

- No prometer borrado de todos los tabs/cachés: el dashboard actual conserva solo su encabezado y control. Si aparecen datos sensibles locales, evaluar el hallazgo antes de ampliar alcance; no borrar almacenamiento especulativamente.
- El endpoint debe ser idempotente: múltiples llamadas no causan error.

---

## Specs relacionadas

- [login.md](./login.md) — SCRUM-7 / HU-02
