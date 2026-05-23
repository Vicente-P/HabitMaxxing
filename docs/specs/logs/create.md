# Endpoint: Registrar cumplimiento diario

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-15](https://vperezc18.atlassian.net/browse/SCRUM-15) / HU-10, [SCRUM-16](https://vperezc18.atlassian.net/browse/SCRUM-16) / HU-11 |
| **Épica** | SCRUM-3 / EP-03 — Registro Diario |
| **Story Points** | 2 + 3 |
| **Autenticación** | Sí requerida |

## Descripción

Registra o actualiza el cumplimiento diario de un hábito. Para hábitos **binarios** funciona como toggle (completado/pendiente). Para hábitos **numéricos** guarda un valor con unidad. Un único registro por hábito por día (upsert).

---

## Request

```
POST /api/habits/:id/logs
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |
| Cookie | Sesión Auth.js | Sí |

### Path params

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID del hábito (`cuid`) |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `date` | `string` | No | ISO date `YYYY-MM-DD`. Default: hoy |
| `completed` | `boolean` | Condicional | Requerido para BINARY (toggle) |
| `value` | `number` | Condicional | Requerido para NUMERIC. Debe ser > 0 |

**Hábito binario — marcar completado:**

```json
{
  "completed": true
}
```

**Hábito binario — revertir a pendiente:**

```json
{
  "completed": false
}
```

**Hábito numérico:**

```json
{
  "value": 5
}
```

**Con fecha explícita:**

```json
{
  "date": "2026-05-22",
  "value": 3.5
}
```

---

## Responses

### 200 OK — Registro creado/actualizado

**Binario completado:**

```json
{
  "data": {
    "id": "clx7k2m9n0003qz8f3log1234",
    "habitId": "clx7k2m9n0001qz8f3hab5678",
    "date": "2026-05-22",
    "completed": true,
    "value": null,
    "createdAt": "2026-05-22T08:15:00.000Z"
  }
}
```

**Numérico:**

```json
{
  "data": {
    "id": "clx7k2m9n0004qz8f3log5678",
    "habitId": "clx7k2m9n0002qz8f3hab9012",
    "date": "2026-05-22",
    "completed": true,
    "value": 5.0,
    "createdAt": "2026-05-22T19:30:00.000Z"
  }
}
```

### 400 Bad Request — Validación

**Valor numérico inválido:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "value",
        "message": "El valor debe ser mayor a 0"
      }
    ]
  }
}
```

**Día no programado:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Este hábito no está programado para este día"
  }
}
```

**Fecha futura:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No se puede registrar en fechas futuras"
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Debes iniciar sesión para acceder a este recurso"
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para registrar este hábito"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Hábito no encontrado"
  }
}
```

---

## Comportamiento por tipo

### BINARY (HU-10 / SCRUM-15)

| Acción | Body | Resultado |
|--------|------|-----------|
| Completar | `{ "completed": true }` | Crea/actualiza log con `completed: true` |
| Revertir | `{ "completed": false }` | Actualiza log con `completed: false` o elimina log |

### NUMERIC (HU-11 / SCRUM-16)

| Acción | Body | Resultado |
|--------|------|-----------|
| Registrar valor | `{ "value": 5 }` | Upsert con `completed: true`, `value: 5` |
| Reemplazar valor | `{ "value": 8 }` | Reemplaza registro del día |
| Valor inválido | `{ "value": 0 }` | 400 — "El valor debe ser mayor a 0" |

---

## Criterios de aceptación (Jira)

### HU-10 — Binario (SCRUM-15)

- **CA-01:** Dado que tengo un hábito binario pendiente, cuando presiono el botón de completar, entonces el hábito cambia visualmente a "completado" y se guarda el registro con la fecha actual.
- **CA-02:** Dado que marqué un hábito como completado, cuando presiono nuevamente, entonces el registro se revierte a "pendiente".

### HU-11 — Numérico (SCRUM-16)

- **CA-01:** Dado que tengo un hábito numérico, cuando ingreso un valor y confirmo, entonces el registro se guarda con el valor y la unidad configurada (ej. "5 km").
- **CA-02:** Dado que registro un hábito numérico, cuando ingreso un valor negativo o cero, entonces veo "El valor debe ser mayor a 0".
- **CA-03:** Dado que ya registré un valor hoy, cuando ingreso un nuevo valor, entonces el registro anterior es reemplazado.

---

## Tests requeridos

### Binario

- [ ] Toggle a completado crea log con `completed: true` y fecha actual.
- [ ] Toggle a pendiente actualiza log con `completed: false`.
- [ ] Segundo toggle revierte estado (CA-02).

### Numérico

- [ ] Valor positivo crea log con `completed: true` y `value`.
- [ ] Valor 0 retorna 400.
- [ ] Valor negativo retorna 400.
- [ ] Segundo registro del mismo día reemplaza el anterior (upsert).

### General

- [ ] Registro en día no programado retorna 400.
- [ ] Registro en fecha futura retorna 400.
- [ ] Hábito de otro usuario retorna 403.
- [ ] Hábito inexistente retorna 404.
- [ ] Sin sesión retorna 401.
- [ ] Constraint `@@unique([habitId, date])` respetado via upsert.

---

## Notas de implementación

- Usar `prisma.habitLog.upsert()` con clave compuesta `habitId_date`.
- Validar que el día de la semana de `date` esté en `habit.frequency`.
- Para NUMERIC: establecer `completed: true` automáticamente cuando `value > 0`.
- Schema Zod: `createLogSchema` con discriminated union por `HabitType`.

## Notas de seguridad

- Verificar ownership del hábito antes de registrar.

---

## Modelos relacionados

- [habit.md](../models/habit.md)
- [habit-log.md](../models/habit-log.md)
