# Modelo: HabitLog

## Descripción

Representa el registro diario de cumplimiento de un hábito. Existe **un único registro por hábito por día**. Soporta toggle para hábitos binarios y valor numérico para hábitos numéricos.

---

## Campos

| Campo | Tipo | Requerido | Descripción | Validaciones |
|-------|------|-----------|-------------|--------------|
| `id` | `String` | Sí (auto) | Identificador único | `cuid()`, generado por Prisma |
| `habitId` | `String` | Sí | ID del hábito asociado | FK a `Habit.id` |
| `date` | `DateTime` | Sí | Fecha del registro | `@db.Date` — solo fecha. ISO 8601 en API |
| `completed` | `Boolean` | Sí | Si el hábito fue cumplido | Default `false`. Para BINARY: toggle. Para NUMERIC: `true` si hay valor > 0 |
| `value` | `Float` | Condicional | Valor numérico registrado | Requerido si `Habit.type = NUMERIC` y `completed = true`. Debe ser > 0 |
| `createdAt` | `DateTime` | Sí (auto) | Fecha de creación del registro | ISO 8601 en API |

---

## Relaciones

| Relación | Modelo | Cardinalidad | onDelete |
|----------|--------|--------------|----------|
| `habit` | `Habit` | N:1 | Cascade |

---

## Constraints y reglas de negocio

- Constraint `@@unique([habitId, date])` — máximo un log por hábito por día.
- Si ya existe un log para la fecha, un nuevo registro **reemplaza** el anterior (upsert).
- Para hábitos **binarios**: toggle entre `completed: true` y `completed: false`.
- Para hábitos **numéricos**: `value` debe ser mayor a 0; al registrar, `completed` se establece en `true`.
- Solo se pueden registrar logs en días programados según `Habit.frequency` (validación en endpoint).
- No se puede registrar en fechas futuras.

---

## Esquema Prisma

```prisma
model HabitLog {
  id        String   @id @default(cuid())
  habitId   String
  date      DateTime @db.Date
  completed Boolean  @default(false)
  value     Float?
  createdAt DateTime @default(now())
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
}
```

---

## Ejemplo JSON — hábito binario completado

```json
{
  "id": "clx7k2m9n0003qz8f3log1234",
  "habitId": "clx7k2m9n0001qz8f3hab5678",
  "date": "2026-05-22",
  "completed": true,
  "value": null,
  "createdAt": "2026-05-22T08:15:00.000Z"
}
```

## Ejemplo JSON — hábito numérico

```json
{
  "id": "clx7k2m9n0004qz8f3log5678",
  "habitId": "clx7k2m9n0002qz8f3hab9012",
  "date": "2026-05-22",
  "completed": true,
  "value": 5.0,
  "createdAt": "2026-05-22T19:30:00.000Z"
}
```

---

## Specs relacionadas

- [create.md](../logs/create.md) — SCRUM-15 / HU-10, SCRUM-16 / HU-11
- [stats.md](../logs/stats.md) — SCRUM-17 / HU-12, SCRUM-18 / HU-13, SCRUM-19 / HU-14
