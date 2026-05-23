# Endpoint: Listar hábitos

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-14](https://vperezc18.atlassian.net/browse/SCRUM-14) / HU-09 |
| **Épica** | SCRUM-2 / EP-02 — Gestión de Hábitos |
| **Story Points** | 2 |
| **Autenticación** | Sí requerida |

## Descripción

Retorna los hábitos del usuario autenticado. Soporta filtro por día de la semana para mostrar en el dashboard únicamente los hábitos programados para hoy (o el día indicado), incluyendo su estado de completado.

---

## Request

```
GET /api/habits
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| Cookie | Sesión Auth.js | Sí |

### Query params

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `day` | `number` | No | Día de la semana (0–6). Default: día actual del servidor |
| `date` | `string` | No | Fecha ISO (`YYYY-MM-DD`) para obtener estado de completado. Default: hoy |

**Ejemplos:**

```
GET /api/habits
GET /api/habits?day=1
GET /api/habits?day=1&date=2026-05-22
```

---

## Responses

### 200 OK — Con hábitos

```json
{
  "data": [
    {
      "id": "clx7k2m9n0001qz8f3hab5678",
      "name": "Meditar 10 minutos",
      "type": "BINARY",
      "unit": null,
      "frequency": [1, 2, 3, 4, 5],
      "userId": "clx7k2m9n0000qz8f3abc1234",
      "createdAt": "2026-05-22T11:00:00.000Z",
      "updatedAt": "2026-05-22T11:00:00.000Z",
      "todayLog": {
        "id": "clx7k2m9n0003qz8f3log1234",
        "completed": true,
        "value": null,
        "date": "2026-05-22"
      }
    },
    {
      "id": "clx7k2m9n0002qz8f3hab9012",
      "name": "Correr",
      "type": "NUMERIC",
      "unit": "km",
      "frequency": [1, 3, 5],
      "userId": "clx7k2m9n0000qz8f3abc1234",
      "createdAt": "2026-05-22T11:05:00.000Z",
      "updatedAt": "2026-05-22T11:05:00.000Z",
      "todayLog": null
    }
  ],
  "meta": {
    "day": 1,
    "date": "2026-05-22",
    "total": 2
  }
}
```

> `todayLog` es `null` si no hay registro para la fecha consultada. El frontend diferencia visualmente completados (`completed: true`) de pendientes (`todayLog: null` o `completed: false`).

### 200 OK — Sin hábitos

```json
{
  "data": [],
  "meta": {
    "day": 1,
    "date": "2026-05-22",
    "total": 0
  }
}
```

> Frontend muestra: "Crea tu primer hábito para comenzar".

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Debes iniciar sesión para acceder a este recurso"
  }
}
```

---

## Comportamiento del filtro por día

- Si `day` no se envía, usar el día de la semana de la fecha actual.
- Solo retornar hábitos cuyo `frequency` incluya el `day` solicitado.
- Si un hábito no está programado para ese día, **no aparece** en la lista.
- Incluir `todayLog` con el registro de la fecha consultada (join con `HabitLog`).

---

## Criterios de aceptación (Jira)

- **CA-01:** Dado que accedo al dashboard, cuando es un día en que tengo hábitos programados, entonces veo únicamente los hábitos de ese día con su estado actual.
- **CA-02:** Dado que accedo al dashboard, cuando no tengo hábitos creados, entonces veo un mensaje "Crea tu primer hábito para comenzar".
- **CA-03:** Dado que tengo hábitos en el dashboard, cuando un hábito ya fue completado hoy, entonces aparece visualmente diferenciado de los pendientes.

> CA-02 y CA-03 son parcialmente frontend; la API provee `data: []` y `todayLog.completed`.

---

## Tests requeridos

- [ ] Usuario con hábitos programados para hoy retorna solo esos hábitos.
- [ ] Hábito no programado para el día consultado no aparece en la lista.
- [ ] Hábito completado incluye `todayLog.completed: true`.
- [ ] Hábito pendiente incluye `todayLog: null` o `completed: false`.
- [ ] Usuario sin hábitos retorna `data: []`.
- [ ] Filtro `?day=3` retorna solo hábitos con `3` en `frequency`.
- [ ] Filtro `?date=2026-05-20` retorna logs de esa fecha específica.
- [ ] Sin sesión retorna 401.
- [ ] No retorna hábitos de otros usuarios.

---

## Notas de implementación

- Query Prisma con `where: { userId, frequency: { has: day } }`.
- Left join con `HabitLog` filtrado por `date`.
- Considerar timezone del usuario en futuras iteraciones; MVP usa fecha del servidor.

## Notas de seguridad

- Filtrar siempre por `userId` de la sesión activa.

---

## Modelos relacionados

- [habit.md](../models/habit.md)
- [habit-log.md](../models/habit-log.md)
