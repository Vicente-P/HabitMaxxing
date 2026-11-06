# Endpoint: Actualizar hábito

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-12](https://vperezc18.atlassian.net/browse/SCRUM-12) / HU-07 |
| **Épica** | SCRUM-2 / EP-02 — Gestión de Hábitos |
| **Story Points** | 2 |
| **Autenticación** | Sí requerida |

## Descripción

Actualiza parcialmente un hábito existente del usuario autenticado. Permite modificar nombre, unidad y frecuencia; el tipo no es editable. Al eliminar días de la frecuencia que ya tienen registros, los logs existentes **no se eliminan** — el frontend debe mostrar advertencia.

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
| `unit` | `string` \| `null` | No | Máx. 30 caracteres; obligatoria (no vacía ni `null`) si el hábito es `NUMERIC`; solo `null` si es `BINARY` |
| `frequency` | `number[]` | No | Enteros 0–6, sin repetir, al menos 1 si presente; se guarda ordenada |

El body debe incluir al menos un campo. `type` no es editable: enviarlo responde 400 (`field: "type"`, "El tipo de un hábito no se puede modificar"). Cualquier otra clave (por ejemplo `userId`) responde 400.

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

Solo por los controles de la petición (`Origin` distinto de `APP_ORIGIN`), igual que en las demás rutas de hábitos que escriben. Un hábito de otro usuario **no** responde 403: ver 404.

### 404 Not Found

Hábito inexistente o perteneciente a otro usuario; ambas respuestas son idénticas byte a byte.

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

- [x] Actualizar nombre retorna 200 con nombre nuevo.
- [x] Actualizar frecuencia retorna 200 con frecuencia nueva.
- [x] Actualizar unit en hábito numérico retorna 200.
- [x] Enviar `type` retorna 400 (el tipo no es editable); `unit` en hábito binario o `unit` vacía/`null` en numérico retorna 400.
- [x] Eliminar días con logs existentes retorna 200 con warning `FREQUENCY_DAYS_REMOVED` y solo los días removidos que tienen registros.
- [x] Logs de días removidos persisten en DB tras actualización (contrato del repositorio, también sobre PostgreSQL).
- [x] Hábito de otro usuario retorna 404, idéntico al de un hábito inexistente.
- [x] Hábito inexistente retorna 404.
- [x] Sin sesión retorna 401.
- [x] Body vacío retorna 400 (`field: "form"`, "Debes enviar al menos un campo para actualizar").

---

## Notas de implementación

- Decisiones HU-07 (2026-11-05), resueltas por el usuario: un hábito ajeno responde 404 `NOT_FOUND` idéntico al inexistente (como `POST /api/habits/:id/logs`), para no revelar qué IDs existen; el tipo no se edita, porque cambiarlo dejaría los registros previos incoherentes. Body vacío: 400.
- Validación de forma antes de consultar el hábito; después, ownership (404) y la unidad según el tipo guardado.
- La escritura misma filtra por dueño (`updateMany` con `id` y `userId`); si no actualiza nada, responde 404.
- `removedDays` lista solo los días quitados de `frequency` en los que el hábito tiene algún registro (cualquier fila de `HabitLog`, incluso `completed: false`).
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
