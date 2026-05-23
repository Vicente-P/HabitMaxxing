# Endpoint: Cierre de sesión

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-8](https://vperezc18.atlassian.net/browse/SCRUM-8) / HU-03 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 1 |
| **Autenticación** | Sí requerida |

## Descripción

Invalida la sesión activa del usuario autenticado. Tras cerrar sesión, el usuario es redirigido al login y no puede acceder a rutas protegidas sin autenticarse nuevamente.

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
| Cookie | Sesión Auth.js | Sí |

No requiere body.

---

## Responses

### 200 OK — Sesión invalidada

```json
{
  "data": {
    "message": "Sesión cerrada exitosamente"
  }
}
```

> Auth.js puede retornar redirect en lugar de JSON según configuración CSRF.

### 401 Unauthorized — Sin sesión activa

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No hay sesión activa"
  }
}
```

---

## Comportamiento en frontend

1. Usuario presiona "Cerrar sesión".
2. Cliente llama `signOut({ redirect: true, callbackUrl: "/login" })`.
3. Cookie de sesión eliminada.
4. Redirect a `/login`.
5. Intentos de acceder a `/dashboard` redirigen automáticamente a `/login`.

---

## Criterios de aceptación (Jira)

- **CA-01:** Dado que estoy autenticado, cuando presiono "Cerrar sesión", entonces soy redirigido al login y mi sesión es invalidada.
- **CA-02:** Dado que cerré sesión, cuando intento acceder a una ruta protegida, entonces soy redirigido al login automáticamente.

---

## Tests requeridos

- [ ] Logout con sesión activa invalida la cookie de sesión.
- [ ] Tras logout, `GET /api/auth/session` retorna `null`.
- [ ] Tras logout, acceso a `GET /api/habits` retorna 401.
- [ ] Tras logout, navegación a `/dashboard` redirige a `/login`.
- [ ] Logout sin sesión activa retorna 401 o redirige sin error crítico.

---

## Notas de implementación

- Usar `signOut()` de `next-auth/react` en componentes cliente.
- Middleware en `src/middleware.ts` (si aplica) debe verificar sesión en rutas `(dashboard)/*`.
- No requiere invalidación manual de tokens — Auth.js elimina la cookie.

## Notas de seguridad

- Limpiar cualquier estado local del cliente (cache, localStorage de datos sensibles) tras logout.
- El endpoint debe ser idempotente: múltiples llamadas no causan error.

---

## Specs relacionadas

- [login.md](./login.md) — SCRUM-7 / HU-02
