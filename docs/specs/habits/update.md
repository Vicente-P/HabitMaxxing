# Endpoint: Actualizar hábito

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-12](https://vperezc18.atlassian.net/browse/SCRUM-12) / HU-07 |
| **Épica** | SCRUM-2 / EP-02 — Gestión de Hábitos |
| **Story Points** | 2 |
| **Autenticación** | Sí requerida |

## Descripción

Actualiza parcialmente un hábito existente del usuario autenticado. Permite modificar nombre, tipo, unidad y frecuencia. Al eliminar días de la frecuencia que ya tienen registros, los logs existentes **no se eliminan** — el frontend debe mostrar advertencia.

---

## Request

```
PATCH /api/habits/:id
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

Todos los campos son opcionales (actualización parcial):

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `name` | `string` | No | No vacío si presente, máx. 100 caracteres |
| `type` | `"BINARY"` \| `"NUMERIC"` | No | Enum HabitType |
| `unit` | `string` \| `null` | No | Requerido si `type = NUMERIC`; null si `BINARY` |
| `frequency` | `number[]` | No | Enteros 0–6, al menos 1 si presente |

```json
{
  "name": "Correr 5K",
  "frequency": [1, 2, 3, 4, 5]
}
```

---

## Responses

### 200 OK

```json
{
  "data": {
    "id": "clx7k2m9n0001qz8f3hab5678",
    "name": "Correr 5K",
    "type": "NUMERIC",
    "unit": "km",
    "frequency": [1, 2, 3, 4, 5],
    "userId": "clx7k2m9n0000qz8f3abc1234",
    "createdAt": "2026-05-22T11:00:00.000Z",
    "updatedAt": "2026-05-22T12:00:00.000Z"
  }
}
```

### 200 OK — Con advertencia de frecuencia

Cuando se eliminan días con registros existentes:

```json
{
  "data": {
    "id": "clx7k2m9n0001qz8f3hab5678",
    "name": "Correr 5K",
    "type": "NUMERIC",
    "unit": "km",
    "frequency": [1, 3, 5],
    "userId": "clx7k2m9n0000qz8f3abc1234",
    "createdAt": "2026-05-22T11:00:00.000Z",
    "updatedAt": "2026-05-22T12:00:00.000Z"
  },
  "warnings": [
    {
      "code": "FREQUENCY_DAYS_REMOVED",
      "message": "Los registros de ese día no serán eliminados",
      "removedDays": [2, 4]
    }
  ]
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
        "field": "name",
        "message": "El nombre del hábito es obligatorio"
      }
    ]
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

Hábito pertenece a otro usuario.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para modificar este hábito"
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

## Criterios de aceptación (Jira)

- **CA-01:** Dado que quiero editar un hábito, cuando modifico su nombre, frecuencia o unidad, entonces los cambios se reflejan inmediatamente en el dashboard.
- **CA-02:** Dado que edito la frecuencia de un hábito, cuando elimino un día que ya tiene registros, entonces veo una advertencia "Los registros de ese día no serán eliminados".

---

## Tests requeridos

- [ ] Actualizar nombre retorna 200 con nombre nuevo.
- [ ] Actualizar frecuencia retorna 200 con frecuencia nueva.
- [ ] Actualizar unit en hábito numérico retorna 200.
- [ ] Cambiar type de BINARY a NUMERIC sin unit retorna 400.
- [ ] Eliminar días con logs existentes retorna 200 con warning `FREQUENCY_DAYS_REMOVED`.
- [ ] Logs de días removidos persisten en DB tras actualización.
- [ ] Hábito de otro usuario retorna 403.
- [ ] Hábito inexistente retorna 404.
- [ ] Sin sesión retorna 401.
- [ ] Body vacío retorna 200 sin cambios (o 400 según implementación).

---

## Notas de implementación

- Verificar ownership: `habit.userId === session.user.id`.
- Detectar días removidos comparando `frequency` anterior vs nueva.
- Consultar `HabitLog` en días removidos para generar warning.
- Schema Zod: `updateHabitSchema` (partial de create).

## Notas de seguridad

- Validar ownership antes de cualquier modificación.
- No permitir cambiar `userId`.

---

## Modelo relacionado

- [habit.md](../models/habit.md)
