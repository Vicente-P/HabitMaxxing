# Endpoint: Inicio de sesión

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-7](https://vperezc18.atlassian.net/browse/SCRUM-7) / HU-02 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 5 |
| **Autenticación** | No requerida |

## Descripción

Autentica a un usuario registrado con email y contraseña. Utiliza **Auth.js v5** con estrategia de credenciales y sesiones basadas en cookies. Tras login exitoso, el usuario accede al dashboard con sus hábitos disponibles.

> **Nota:** Auth.js maneja el flujo de login internamente. En el cliente se usa `signIn("credentials", { email, password })`. Opcionalmente puede existir un Route Handler wrapper para validación previa con Zod.

---

## Request

### Opción A — Auth.js (recomendada)

```
POST /api/auth/callback/credentials
```

Gestionado por el handler de Auth.js en `src/app/api/auth/[...nextauth]/route.ts`.

### Opción B — Wrapper REST (opcional)

```
POST /api/auth/login
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `email` | `string` | Sí | Formato email válido |
| `password` | `string` | Sí | No vacío |

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña-segura"
}
```

---

## Responses

### 200 OK — Login exitoso

Sesión creada. Cookie de sesión establecida por Auth.js.

```json
{
  "data": {
    "user": {
      "id": "clx7k2m9n0000qz8f3abc1234",
      "email": "usuario@ejemplo.com",
      "name": "Vicente"
    },
    "expires": "2026-06-22T10:30:00.000Z"
  }
}
```

### 401 Unauthorized — Credenciales incorrectas

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Credenciales incorrectas"
  }
}
```

> No especificar si el email o la contraseña falló.

### 400 Bad Request — Validación

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

### 429 Too Many Requests — Cuenta bloqueada

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Cuenta bloqueada temporalmente, intenta en 15 minutos"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor"
  }
}
```

---

## Sesión activa

```
GET /api/auth/session
```

Retorna la sesión activa o `null` si no hay sesión.

**Con sesión:**

```json
{
  "user": {
    "id": "clx7k2m9n0000qz8f3abc1234",
    "email": "usuario@ejemplo.com",
    "name": "Vicente"
  },
  "expires": "2026-06-22T10:30:00.000Z"
}
```

**Sin sesión:**

```json
null
```

---

## Criterios de aceptación (Jira)

- **CA-01:** Dado que soy usuario registrado, cuando ingreso email y contraseña correctos, entonces accedo al dashboard con mis hábitos disponibles.
- **CA-02:** Dado que intento iniciar sesión, cuando ingreso credenciales incorrectas, entonces veo "Credenciales incorrectas" sin especificar cuál campo falló.
- **CA-03:** Dado que fallé el login 5 veces consecutivas, cuando intento iniciar sesión nuevamente, entonces veo "Cuenta bloqueada temporalmente, intenta en 15 minutos".
- **CA-04:** Dado que inicio sesión exitosamente, cuando cierro y vuelvo a abrir la app, entonces mi sesión sigue activa sin reingresar credenciales.

---

## Tests requeridos

- [ ] Login con credenciales correctas establece sesión y retorna datos del usuario.
- [ ] Login con email inexistente retorna 401 con mensaje genérico.
- [ ] Login con password incorrecto retorna 401 con mensaje genérico.
- [ ] 5 intentos fallidos consecutivos bloquean la cuenta por 15 minutos (429).
- [ ] Tras bloqueo, login con credenciales correctas también retorna 429 hasta expirar.
- [ ] Sesión persiste tras cerrar y reabrir el navegador (CA-04).
- [ ] `GET /api/auth/session` retorna usuario con sesión activa o `null` sin sesión.
- [ ] Email inválido retorna 400.

---

## Notas de implementación

- Configurar provider `Credentials` en `src/lib/auth.ts`.
- Comparar password con `bcrypt.compare()` contra el hash en DB.
- Contador de intentos fallidos: puede almacenarse en memoria (dev) o en DB/Redis (prod).
- Auth.js gestiona la cookie de sesión; no emitir JWT manualmente.
- Proteger rutas del dashboard con middleware o `auth()` en Server Components.

## Notas de seguridad

- Mensaje genérico en fallo de login para no revelar existencia de emails.
- Resetear contador de intentos fallidos tras login exitoso.
- Cookie `httpOnly`, `secure` en producción, `sameSite: lax`.

---

## Modelo relacionado

- [user.md](../models/user.md)
