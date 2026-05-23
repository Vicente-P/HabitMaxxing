# Endpoint: Recuperación de contraseña

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-9](https://vperezc18.atlassian.net/browse/SCRUM-9) / HU-04 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 3 |
| **Autenticación** | No requerida |

## Descripción

Permite a un usuario que olvidó su contraseña solicitar un enlace de recuperación por email y restablecer su contraseña. El flujo consta de dos endpoints: solicitud del enlace y reset con token.

---

## 1. Solicitar enlace de recuperación

```
POST /api/auth/forgot-password
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `email` | `string` | Sí | Formato email válido |

```json
{
  "email": "usuario@ejemplo.com"
}
```

### Responses

#### 200 OK — Solicitud procesada

Siempre retorna 200 aunque el email no exista (seguridad).

```json
{
  "data": {
    "message": "Si el correo está registrado, recibirás un enlace de recuperación"
  }
}
```

#### 400 Bad Request — Validación

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

---

## 2. Restablecer contraseña

```
POST /api/auth/reset-password
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `token` | `string` | Sí | Token válido y no expirado |
| `password` | `string` | Sí | Mínimo 8 caracteres |

```json
{
  "token": "abc123def456...",
  "password": "nueva-contraseña-segura"
}
```

### Responses

#### 200 OK — Contraseña actualizada

```json
{
  "data": {
    "message": "Contraseña actualizada exitosamente"
  }
}
```

#### 400 Bad Request — Token expirado

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "El enlace ha expirado, solicita uno nuevo"
  }
}
```

#### 400 Bad Request — Validación de password

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

#### 404 Not Found — Token inválido

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Token de recuperación inválido"
  }
}
```

---

## Flujo completo

```
1. Usuario ingresa email en /forgot-password
2. POST /api/auth/forgot-password
3. Sistema genera token (expira en 30 min) y envía email con enlace
4. Usuario hace clic en enlace → /reset-password?token=...
5. Usuario ingresa nueva contraseña
6. POST /api/auth/reset-password
7. Usuario puede iniciar sesión con la nueva contraseña
```

---

## Criterios de aceptación (Jira)

- **CA-01:** Dado que olvidé mi contraseña, cuando ingreso mi email registrado, entonces recibo un correo con un enlace de recuperación válido por 30 minutos.
- **CA-02:** Dado que recibo el enlace de recuperación, cuando ingreso y confirmo mi nueva contraseña, entonces puedo iniciar sesión con la nueva contraseña.
- **CA-03:** Dado que el enlace de recuperación expiró, cuando intento usarlo, entonces veo "El enlace ha expirado, solicita uno nuevo".

---

## Tests requeridos

### forgot-password

- [ ] Email registrado genera token y retorna 200 con mensaje genérico.
- [ ] Email no registrado retorna 200 con el mismo mensaje genérico (no revelar existencia).
- [ ] Email inválido retorna 400.
- [ ] Token generado expira en 30 minutos.

### reset-password

- [ ] Token válido + password válido actualiza hash y retorna 200.
- [ ] Token expirado retorna 400 con `TOKEN_EXPIRED`.
- [ ] Token inválido/inexistente retorna 404.
- [ ] Password menor a 8 caracteres retorna 400.
- [ ] Tras reset exitoso, login con nueva password funciona.
- [ ] Tras reset exitoso, login con password anterior falla.
- [ ] Token usado no puede reutilizarse.

---

## Notas de implementación

- Almacenar tokens en tabla dedicada o campo temporal en `User` con `expiresAt`.
- Token: string aleatorio seguro (crypto.randomBytes o similar).
- Hashear nueva password con bcryptjs (`saltRounds: 12`).
- Invalidar token tras uso exitoso.
- Servicio de email para envío del enlace (Resend, Nodemailer, etc.).

## Notas de seguridad

- No revelar si el email existe en `forgot-password`.
- Token de un solo uso.
- Expiración estricta de 30 minutos.
- Rate limiting en `forgot-password` para prevenir spam.

---

## Modelo relacionado

- [user.md](../models/user.md)
