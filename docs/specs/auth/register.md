# Endpoint: Registro de usuario

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-6](https://vperezc18.atlassian.net/browse/SCRUM-6) / HU-01 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 3 |
| **Autenticación** | No requerida |

## Descripción

Crea una nueva cuenta de usuario con email y contraseña. Hashea la contraseña, persiste el usuario en la base de datos y retorna los datos del usuario creado (sin password). Tras el registro exitoso, el frontend redirige al dashboard.

---

## Request

```
POST /api/auth/register
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `email` | `string` | Sí | Formato email válido |
| `password` | `string` | Sí | Mínimo 8 caracteres |
| `name` | `string` | No | Máx. 100 caracteres |

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña-segura",
  "name": "Vicente"
}
```

---

## Responses

### 201 Created

Usuario creado exitosamente.

```json
{
  "data": {
    "id": "clx7k2m9n0000qz8f3abc1234",
    "email": "usuario@ejemplo.com",
    "name": "Vicente",
    "createdAt": "2026-05-22T10:30:00.000Z",
    "updatedAt": "2026-05-22T10:30:00.000Z"
  }
}
```

### 400 Bad Request — Validación

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

### 409 Conflict — Email duplicado

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Este correo ya está en uso"
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

## Criterios de aceptación (Jira)

- **CA-01:** Dado que soy usuario nuevo, cuando ingreso email válido y contraseña de mínimo 8 caracteres, entonces mi cuenta es creada y soy redirigido al dashboard.
- **CA-02:** Dado que intento registrarme, cuando ingreso un email ya registrado, entonces veo "Este correo ya está en uso".
- **CA-03:** Dado que intento registrarme, cuando ingreso una contraseña menor a 8 caracteres, entonces veo un mensaje con los requisitos de contraseña.
- **CA-04:** Dado que completo el registro, cuando reviso mi bandeja de entrada, entonces recibo un email de bienvenida.

---

## Tests requeridos

- [ ] Registro exitoso con email, password y name válidos retorna 201 y usuario sin password.
- [ ] Registro exitoso sin `name` retorna 201 con `name: null`.
- [ ] Email inválido retorna 400 con `VALIDATION_ERROR`.
- [ ] Password menor a 8 caracteres retorna 400 con mensaje de requisitos.
- [ ] Email duplicado retorna 409 con mensaje "Este correo ya está en uso".
- [ ] Password se almacena hasheado (no en texto plano) en DB.
- [ ] Body vacío o campos faltantes retorna 400.

---

## Notas de implementación

- Hashear password con `bcryptjs` (`saltRounds: 12`) antes de `prisma.user.create()`.
- Schema Zod: `registerSchema` en `src/lib/validations.ts`.
- El email de bienvenida (CA-04) es responsabilidad del servicio de email; puede implementarse de forma asíncrona.
- Tras 201, el frontend puede llamar a `signIn()` de Auth.js para iniciar sesión automáticamente o redirigir al login.

## Notas de seguridad

- Nunca incluir `password` en la respuesta.
- Normalizar email a minúsculas antes de persistir y comparar.
- Rate limiting recomendado en producción para prevenir registro masivo.

---

## Modelo relacionado

- [user.md](../models/user.md)
