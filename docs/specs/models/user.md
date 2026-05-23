# Modelo: User

## Descripción

Representa un usuario registrado en Habit Maxxing. Es la entidad raíz de ownership: cada usuario posee sus propios hábitos y registros. La contraseña se almacena hasheada y nunca se expone en la API.

---

## Campos

| Campo | Tipo | Requerido | Descripción | Validaciones |
|-------|------|-----------|-------------|--------------|
| `id` | `String` | Sí (auto) | Identificador único | `cuid()`, generado por Prisma |
| `email` | `String` | Sí | Email del usuario, usado para login | Formato email válido, único en DB |
| `password` | `String` | Sí | Hash bcrypt de la contraseña | Mínimo 8 caracteres en registro; nunca en respuestas API |
| `name` | `String` | No | Nombre para mostrar | Máx. 100 caracteres |
| `createdAt` | `DateTime` | Sí (auto) | Fecha de creación | ISO 8601 en API |
| `updatedAt` | `DateTime` | Sí (auto) | Última actualización | ISO 8601 en API |

---

## Relaciones

| Relación | Modelo | Cardinalidad | onDelete |
|----------|--------|--------------|----------|
| `habits` | `Habit` | 1:N | Cascade |

---

## Constraints y reglas de negocio

- `email` tiene constraint `@unique` — no pueden existir dos usuarios con el mismo email.
- Al eliminar un `User`, se eliminan en cascada todos sus `Habit` y `HabitLog` asociados.
- La contraseña se hashea con bcryptjs (`saltRounds: 12`) antes de persistir.
- Tras 5 intentos fallidos consecutivos de login, la cuenta se bloquea temporalmente por 15 minutos.
- El email de bienvenida se envía tras registro exitoso (HU-01 / SCRUM-6).

---

## Esquema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  habits    Habit[]
}
```

---

## Ejemplo JSON (respuesta API)

> Sin campo `password`.

```json
{
  "id": "clx7k2m9n0000qz8f3abc1234",
  "email": "usuario@ejemplo.com",
  "name": "Vicente",
  "createdAt": "2026-05-22T10:30:00.000Z",
  "updatedAt": "2026-05-22T10:30:00.000Z"
}
```

---

## Specs relacionadas

- [register.md](../auth/register.md) — SCRUM-6 / HU-01
- [login.md](../auth/login.md) — SCRUM-7 / HU-02
- [forgot-password.md](../auth/forgot-password.md) — SCRUM-9 / HU-04
