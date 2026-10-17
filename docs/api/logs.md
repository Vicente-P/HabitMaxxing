# API — Registros y estadísticas

> ⚠️ **Documento en construcción.** HU-10 (registro de hábitos binarios) está implementada; HU-11 (numéricos) y EP-04 (Estadísticas) están pendientes.

---

## Endpoints implementados

### Registrar cumplimiento diario (solo hábitos BINARY — HU-10)

```
POST /api/habits/:id/logs
```

Contrato completo: [`docs/specs/logs/create.md`](../specs/logs/create.md).

| Aspecto | Comportamiento actual |
|---------|-----------------------|
| Autenticación | Sesión Auth.js; sin sesión válida responde 401 `UNAUTHORIZED` |
| Guardas | `Origin` igual a `APP_ORIGIN` (403), `Content-Type: application/json` (415), cuerpo de hasta 8 KiB (413), JSON objeto (400) |
| Body | `{ "completed": boolean, "date"?: "YYYY-MM-DD" }`. Claves desconocidas (incluido `value`) responden 400 `VALIDATION_ERROR` con `details` |
| Fecha | Por defecto la fecha UTC del servidor; no se aceptan fechas futuras; el día de la semana debe estar en `frequency` |
| Persistencia | Upsert por `(habitId, date)`. Revertir actualiza `completed: false`; no elimina el registro |
| Respuesta 200 | `{ "data": { id, habitId, date, completed, value: null, createdAt } }` |
| Errores | 400 día no programado / fecha futura / hábito NUMERIC (aún no soportado), 404 hábito inexistente o de otro usuario (respuesta idéntica, sin enumeración de ids), 500 `INTERNAL_ERROR` |
| Cabeceras | `Cache-Control: private, no-store` en todas las respuestas |

## Endpoints planeados

### Obtener registros de un hábito

```
GET /api/habits/:id/logs
```

### Estadísticas de cumplimiento

```
GET /api/habits/:id/stats
```

### Heatmap de progreso

```
GET /api/habits/:id/heatmap?year=2026
```

---

*Este documento se completará cuando EP-03 y EP-04 estén implementados.*
