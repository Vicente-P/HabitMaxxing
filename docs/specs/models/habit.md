# Modelo: Habit

## Descripción

Representa un hábito que el usuario desea trackear. Puede ser **binario** (hecho/no hecho) o **numérico** (con valor y unidad de medida). La frecuencia define en qué días de la semana está programado el hábito.

---

## Campos

| Campo | Tipo | Requerido | Descripción | Validaciones |
|-------|------|-----------|-------------|--------------|
| `id` | `String` | Sí (auto) | Identificador único | `cuid()`, generado por Prisma |
| `name` | `String` | Sí | Nombre del hábito | No vacío, máx. 100 caracteres |
| `type` | `HabitType` | Sí | Tipo de hábito | `BINARY` o `NUMERIC` |
| `unit` | `String` | Condicional | Unidad de medida | Requerido si `type = NUMERIC`; nulo si `BINARY`. Ej: "km", "páginas", "vasos" |
| `frequency` | `Int[]` | Sí | Días de la semana programados | Array de enteros 0–6, al menos 1 día. `0=Dom … 6=Sáb` |
| `userId` | `String` | Sí | ID del usuario propietario | FK a `User.id` |
| `createdAt` | `DateTime` | Sí (auto) | Fecha de creación | ISO 8601 en API |
| `updatedAt` | `DateTime` | Sí (auto) | Última actualización | ISO 8601 en API |

---

## Enum: HabitType

| Valor | Descripción |
|-------|-------------|
| `BINARY` | Hábito de completado sí/no (ej. "Meditar") |
| `NUMERIC` | Hábito con valor numérico (ej. "Correr 5 km") |

---

## Relaciones

| Relación | Modelo | Cardinalidad | onDelete |
|----------|--------|--------------|----------|
| `user` | `User` | N:1 | — |
| `logs` | `HabitLog` | 1:N | Cascade |

---

## Constraints y reglas de negocio

- Un hábito pertenece a un único usuario (`userId`).
- `frequency` debe contener al menos un día de la semana.
- Si `type = NUMERIC`, `unit` es obligatorio; si `type = BINARY`, `unit` debe ser `null`.
- Al eliminar un hábito, se eliminan en cascada todos sus `HabitLog`.
- Editar `frequency` para quitar un día **no elimina** registros existentes de ese día (HU-07 / SCRUM-12).
- La racha y el porcentaje de cumplimiento se calculan **solo** sobre días incluidos en `frequency`.
- Los días no programados no penalizan el cumplimiento ni rompen la racha.

---

## Esquema Prisma

```prisma
model Habit {
  id        String     @id @default(cuid())
  name      String
  type      HabitType
  unit      String?
  frequency Int[]
  userId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs      HabitLog[]
}

enum HabitType {
  BINARY
  NUMERIC
}
```

---

## Ejemplo JSON — hábito binario

```json
{
  "id": "clx7k2m9n0001qz8f3hab5678",
  "name": "Meditar 10 minutos",
  "type": "BINARY",
  "unit": null,
  "frequency": [1, 2, 3, 4, 5],
  "userId": "clx7k2m9n0000qz8f3abc1234",
  "createdAt": "2026-05-22T11:00:00.000Z",
  "updatedAt": "2026-05-22T11:00:00.000Z"
}
```

## Ejemplo JSON — hábito numérico

```json
{
  "id": "clx7k2m9n0002qz8f3hab9012",
  "name": "Correr",
  "type": "NUMERIC",
  "unit": "km",
  "frequency": [1, 3, 5],
  "userId": "clx7k2m9n0000qz8f3abc1234",
  "createdAt": "2026-05-22T11:05:00.000Z",
  "updatedAt": "2026-05-22T11:05:00.000Z"
}
```

---

## Specs relacionadas

- [create.md](../habits/create.md) — SCRUM-11 / HU-06
- [update.md](../habits/update.md) — SCRUM-12 / HU-07
- [delete.md](../habits/delete.md) — SCRUM-13 / HU-08
- [list.md](../habits/list.md) — SCRUM-14 / HU-09
