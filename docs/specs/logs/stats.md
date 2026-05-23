# Endpoints: Estadísticas y progreso

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-17](https://vperezc18.atlassian.net/browse/SCRUM-17) / HU-12, [SCRUM-18](https://vperezc18.atlassian.net/browse/SCRUM-18) / HU-13, [SCRUM-19](https://vperezc18.atlassian.net/browse/SCRUM-19) / HU-14 |
| **Épica** | SCRUM-4 / EP-04 — Progreso y Estadísticas |
| **Story Points** | 3 + 5 + 2 |
| **Autenticación** | Sí requerida |

## Descripción

Conjunto de endpoints para consultar racha, calendario heatmap y porcentaje de cumplimiento de un hábito. Todos los cálculos consideran **solo días programados** en `Habit.frequency`.

---

## 1. Estadísticas generales (racha + cumplimiento)

```
GET /api/habits/:id/stats
```

### Query params

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `month` | `string` | No | Mes en formato `YYYY-MM`. Default: mes actual |

### Response 200 OK

```json
{
  "data": {
    "habitId": "clx7k2m9n0001qz8f3hab5678",
    "month": "2026-05",
    "streak": {
      "current": 7,
      "previous": 12,
      "isActive": true
    },
    "completion": {
      "percentage": 85.7,
      "completedDays": 6,
      "scheduledDaysElapsed": 7,
      "message": null
    }
  }
}
```

**Mes recién iniciado sin registros:**

```json
{
  "data": {
    "habitId": "clx7k2m9n0001qz8f3hab5678",
    "month": "2026-05",
    "streak": {
      "current": 0,
      "previous": 0,
      "isActive": false
    },
    "completion": {
      "percentage": 0,
      "completedDays": 0,
      "scheduledDaysElapsed": 0,
      "message": "Cumplimiento: 0% — ¡Empieza hoy!"
    }
  }
}
```

### Lógica de racha (HU-12 / SCRUM-17)

- Iterar hacia atrás desde hoy (o último día programado transcurrido).
- Contar días programados consecutivos con `completed: true`.
- Días **no programados** se ignoran — no rompen ni suman.
- Si la racha se rompió: `current: 0`, `previous: X` (racha anterior más larga).
- `isActive: true` si el último día programado transcurrido está completado.

### Lógica de cumplimiento (HU-14 / SCRUM-19)

```
percentage = (completedDays / scheduledDaysElapsed) × 100
```

- `scheduledDaysElapsed`: días programados en el mes que ya pasaron (incluye hoy).
- `completedDays`: de esos, cuántos tienen log con `completed: true`.
- Redondear a 1 decimal.
- Si `scheduledDaysElapsed = 0`: percentage = 0, message especial.

---

## 2. Logs mensuales (heatmap)

```
GET /api/habits/:id/logs
```

### Query params

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `month` | `string` | Sí | Mes en formato `YYYY-MM` |

### Response 200 OK

```json
{
  "data": {
    "habitId": "clx7k2m9n0001qz8f3hab5678",
    "month": "2026-05",
    "days": [
      {
        "date": "2026-05-01",
        "dayOfWeek": 4,
        "scheduled": true,
        "status": "completed",
        "log": {
          "id": "clx7k2m9n0003qz8f3log1234",
          "completed": true,
          "value": null
        }
      },
      {
        "date": "2026-05-02",
        "dayOfWeek": 5,
        "scheduled": false,
        "status": "not_scheduled",
        "log": null
      },
      {
        "date": "2026-05-03",
        "dayOfWeek": 6,
        "scheduled": true,
        "status": "missed",
        "log": null
      }
    ]
  }
}
```

### Valores de `status` (HU-13 / SCRUM-18)

| Status | Color UI | Condición |
|--------|----------|-----------|
| `completed` | Verde | Día programado con log `completed: true` |
| `missed` | Rojo | Día programado transcurrido sin log o `completed: false` |
| `not_scheduled` | Gris | Día no incluido en `frequency` |
| `pending` | Neutro | Día programado futuro (aún no transcurrido) |
| `partial` | Amarillo | Solo NUMERIC: log con valor pero meta no alcanzada (futuro) |

> MVP: binario usa solo `completed`/`missed`. Numérico: cualquier `value > 0` cuenta como `completed`.

---

## 3. Heatmap anual (alternativo)

```
GET /api/habits/:id/heatmap
```

### Query params

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `year` | `number` | No | Año (ej. 2026). Default: año actual |

### Response 200 OK

```json
{
  "data": {
    "habitId": "clx7k2m9n0001qz8f3hab5678",
    "year": 2026,
    "months": [
      {
        "month": "2026-05",
        "completionRate": 85.7,
        "days": [ ]
      }
    ]
  }
}
```

> Estructura de `days` igual al endpoint mensual. Útil para vista anual compacta.

---

## Responses de error (todos los endpoints)

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
    "message": "No tienes permiso para ver este hábito"
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

### 400 Bad Request — month inválido

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Formato de mes inválido. Usar YYYY-MM"
  }
}
```

---

## Criterios de aceptación (Jira)

### HU-12 — Racha (SCRUM-17)

- **CA-01:** Dado que completé un hábito varios días consecutivos, cuando veo el detalle del hábito, entonces veo "🔥 Racha actual: X días".
- **CA-02:** Dado que rompí mi racha, cuando veo el detalle del hábito, entonces la racha vuelve a 0 y veo "Racha anterior: X días".
- **CA-03:** Dado que tengo días no programados, cuando calculo la racha, entonces los días no programados no rompen ni suman a la racha.

### HU-13 — Heatmap (SCRUM-18)

- **CA-01:** Dado que accedo al detalle de un hábito, cuando veo el calendario del mes actual, entonces cada día programado aparece en verde (cumplido) o rojo (no cumplido).
- **CA-02:** Dado que veo el calendario, cuando un día no estaba programado para ese hábito, entonces aparece en gris neutro sin penalización.
- **CA-03:** Dado que veo el calendario, cuando presiono un día pasado, entonces veo el detalle del registro de ese día.

> CA-03 es interacción frontend usando datos de `log` en cada día.

### HU-14 — Cumplimiento (SCRUM-19)

- **CA-01:** Dado que veo el detalle de un hábito, cuando reviso el mes actual, entonces veo "Cumplimiento: X% este mes" calculado solo sobre días programados transcurridos.
- **CA-02:** Dado que el mes acaba de comenzar, cuando no tengo registros aún, entonces veo "Cumplimiento: 0% — ¡Empieza hoy!".

---

## Tests requeridos

### Racha

- [ ] 5 días programados consecutivos completados → `current: 5`.
- [ ] Día no programado entre días completados no rompe racha.
- [ ] Día programado incumplido rompe racha → `current: 0`, `previous: N`.
- [ ] Sin registros → `current: 0`, `previous: 0`.

### Heatmap

- [ ] Día programado completado → `status: "completed"`.
- [ ] Día programado incumplido → `status: "missed"`.
- [ ] Día no programado → `status: "not_scheduled"`.
- [ ] Día futuro programado → `status: "pending"`.
- [ ] Respuesta incluye todos los días del mes.

### Cumplimiento

- [ ] 6/7 días programados transcurridos completados → `85.7%`.
- [ ] Solo cuenta días programados (ignora días off).
- [ ] Mes sin días transcurridos → 0% con message especial.
- [ ] Día no programado no afecta porcentaje.

### General

- [ ] Hábito de otro usuario → 403.
- [ ] Hábito inexistente → 404.
- [ ] Sin sesión → 401.
- [ ] `month` con formato inválido → 400.

---

## Notas de implementación

- Extraer lógica de cálculo a funciones puras en `src/lib/stats/` (testeable).
- Función `isScheduledDay(date, frequency)`: verifica si `date.getDay()` está en `frequency`.
- Función `getScheduledDaysInRange(start, end, frequency)`: lista días programados en rango.
- Función `calculateStreak(logs, frequency, today)`: racha actual y anterior.
- Función `calculateCompletion(logs, frequency, month)`: porcentaje mensual.
- Considerar timezone en iteraciones futuras.

## Notas de seguridad

- Verificar ownership del hábito en todos los endpoints.

---

## Modelos relacionados

- [habit.md](../models/habit.md)
- [habit-log.md](../models/habit-log.md)

## Specs relacionadas

- [create.md](./create.md) — SCRUM-15 / HU-10, SCRUM-16 / HU-11
