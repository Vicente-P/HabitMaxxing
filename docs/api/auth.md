# API — Autenticación

> ⚠️ **Documento en construcción.** La implementación de EP-01 está en curso.
> Los endpoints se documentarán a medida que se implementen.

---

## Endpoints planeados

### Registro de usuario

```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña-segura",
  "name": "Nombre Opcional"
}
```

**Respuestas:**

| Código | Descripción |
|--------|-------------|
| `201` | Usuario creado exitosamente |
| `400` | Validación fallida (email inválido, contraseña muy corta) |
| `409` | El email ya está registrado |

---

### Login

Manejado internamente por Auth.js via `signIn()` en el cliente. No es un endpoint REST directo sino una acción del SDK de Auth.js.

```
POST /api/auth/signin  ← handler de Auth.js (no documentado como REST)
```

---

### Logout

```
POST /api/auth/signout  ← handler de Auth.js
```

---

### Sesión activa

```
GET /api/auth/session
```

Retorna los datos de la sesión activa o `null` si no hay sesión.

**Respuesta con sesión:**
```json
{
  "user": {
    "id": "clxyz123",
    "email": "usuario@ejemplo.com",
    "name": "Nombre"
  },
  "expires": "2026-06-18T00:00:00.000Z"
}
```

---

*Este documento se completará cuando EP-01 esté implementado.*
