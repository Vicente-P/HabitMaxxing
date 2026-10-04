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
| `email` | `string` | Sí | Recortar espacios exteriores, convertir a minúsculas, formato válido, máximo 254 caracteres |
| `password` | `string` | Sí | Mínimo 8 caracteres y máximo 72 bytes UTF-8; el servidor debe aplicar el límite en bytes antes de bcrypt, que trunca entradas mayores |
| `name` | `string` | No | Recortar espacios exteriores; vacío se normaliza a `null`; máximo 100 caracteres |

El feedback de longitud en interfaz puede contar caracteres; no sustituye la validación del servidor de 72 bytes UTF-8 para la contraseña, ya que un carácter puede ocupar varios bytes.

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
    "message": "No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo"
  }
}
```

### 429 Too Many Requests — Rate limit excedido

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Demasiados intentos, intentá de nuevo en 1 hora"
  }
}
```

> Límite: máx. 3 intentos de registro por IP por hora. Ver [SPEC_CONVENTIONS — Rate limiting](../SPEC_CONVENTIONS.md).

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
- **CA-02:** Dado que intento registrarme y el registro no puede completarse con esos datos, entonces veo "No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo", sin revelar si existe una cuenta.
- **CA-03:** Dado que intento registrarme, cuando ingreso una contraseña menor a 8 caracteres, entonces veo un mensaje con los requisitos de contraseña.

---

## Tests requeridos

- [ ] Registro exitoso con email, password y name válidos retorna 201 y usuario sin password.
- [ ] Registro exitoso sin `name` retorna 201 con `name: null`.
- [ ] Email inválido retorna 400 con `VALIDATION_ERROR`.
- [ ] Password menor a 8 caracteres retorna 400 con mensaje de requisitos.
- [ ] Email duplicado puede retornar 409 internamente; la interfaz muestra el mensaje neutral definido en CA-02, sin confirmar existencia.
- [ ] Email normalizado, trim y límites (254 email, 100 nombre, 72 bytes UTF-8 contraseña) se validan en servidor; nombre vacío se persiste como `null`.
- [ ] Password se almacena hasheado (no en texto plano) en DB.
- [ ] Body vacío o campos faltantes retorna 400.

---

## Notas de implementación

- Hashear password con `bcryptjs` (`saltRounds: 12`) antes de `prisma.user.create()`.
- Schema Zod: `registerSchema` en `src/lib/validations.ts`.
- El envío de correo de bienvenida queda diferido a una historia futura; no forma parte de HU-01.
- Tras 201, el frontend DEBE llamar a `signIn("credentials", { email, password })` de Auth.js para iniciar sesión automáticamente y redirigir al dashboard.

> **Fase 2:** la verificación de email se implementará en una fase posterior. En el MVP, las cuentas quedan activas inmediatamente tras el registro.

## Notas de seguridad

- Nunca incluir `password` en la respuesta.
- Normalizar email a minúsculas antes de persistir y comparar (ver [SPEC_CONVENTIONS — Normalización de email](../SPEC_CONVENTIONS.md)).
- Rate limiting: el requisito existente de máximo 3 intentos por IP por hora se conserva; el mecanismo se define en HUR-004.

## Contrato de pantalla de registro (HU-01)

- Orden visual y de teclado: correo electrónico, nombre (opcional), contraseña y botón «Crear cuenta».
- Cada control tiene etiqueta visible asociada; correo usa `type="email"`, `autocomplete="email"`; nombre `autocomplete="name"`; contraseña `type="password"`, `autocomplete="new-password"`. Indicar los campos opcionales en su etiqueta.
- Validar al perder foco y al enviar; no interrumpir la escritura con errores prematuros. Errores específicos quedan junto al campo y se asocian mediante `aria-describedby`; marcar campos inválidos con `aria-invalid`.
- Mientras se envía, exponer estado «Creando cuenta…», deshabilitar el botón y evitar envíos duplicados. Mantener los valores si el servidor rechaza la petición.
- Conflicto 409, validación u otro rechazo del servidor se presentan con copy neutral y accionable, nunca indicando si el correo está registrado. Los fallos inesperados usan un aviso general sin detalles internos.
- Tras creación 201, intentar inicio automático; si funciona, navegar al dashboard. Si falla, conservar la cuenta, informar «Tu cuenta fue creada, pero no pudimos iniciar sesión. Inicia sesión para continuar.» y ofrecer enlace al login; no repetir ni revertir el registro automáticamente.
- En envío inválido, mover el foco al primer campo erróneo; anunciar el resumen de errores con una región accesible (`role="alert"` o mecanismo equivalente). El estado de envío/success se anuncia sin depender solo del color. El orden de foco sigue el orden visual y todos los controles funcionan con teclado, con foco visible.
- Diseño adaptable: una columna, sin desplazamiento horizontal a 320 CSS px, campos y acciones utilizables con zoom/reflow y orientación estrecha; ampliar el contenedor solo en pantallas mayores sin alterar el orden.
- HU-01 utiliza exclusivamente tema claro. Los tokens dark del sistema permanecen definidos para trabajo futuro, no se activan en esta historia.

---

## Modelo relacionado

- [user.md](../models/user.md)
