# Endpoint: Eliminar hábito

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-13](https://vperezc18.atlassian.net/browse/SCRUM-13) / HU-08 |
| **Épica** | SCRUM-2 / EP-02 — Gestión de Hábitos |
| **Story Points** | 1 |
| **Autenticación** | Sí requerida |

## Descripción

Elimina permanentemente un hábito y todo su historial de registros (`HabitLog`). La acción es irreversible. El frontend debe mostrar modal de confirmación antes de invocar este endpoint.

---

## Request

```
DELETE /api/habits/:id
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| Cookie | Sesión Auth.js | Sí |

### Path params

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID del hábito (`cuid`) |

No requiere body.

---

## Responses

### 200 OK

```json
{
  "data": {
    "message": "Hábito eliminado exitosamente",
    "id": "clx7k2m9n0001qz8f3hab5678"
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
    "message": "No tienes permiso para eliminar este hábito"
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

- **CA-01:** Dado que quiero eliminar un hábito, cuando confirmo la eliminación, entonces el hábito y todo su historial desaparecen permanentemente.
- **CA-02:** Dado que intento eliminar un hábito, cuando presiono eliminar, entonces veo una confirmación "¿Estás seguro? Esta acción no se puede deshacer".

> CA-02 es responsabilidad del frontend (modal de confirmación). El endpoint se invoca solo tras confirmación.

---

## Tests requeridos

- [ ] Eliminar hábito propio retorna 200.
- [ ] Tras eliminar, `GET /api/habits/:id` retorna 404.
- [ ] Tras eliminar, todos los `HabitLog` del hábito se eliminan (cascade).
- [ ] Hábito de otro usuario retorna 403.
- [ ] Hábito inexistente retorna 404.
- [ ] Sin sesión retorna 401.
- [ ] Eliminar el mismo hábito dos veces: segunda llamada retorna 404.

---

## Notas de implementación

- Prisma elimina en cascada `HabitLog` por `@relation(onDelete: Cascade)`.
- Verificar ownership antes de `prisma.habit.delete()`.
- El modal de confirmación (CA-02) se implementa en frontend, no en API.

## Notas de seguridad

- Operación destructiva e irreversible.
- Verificar ownership estrictamente.

---

## Modelo relacionado

- [habit.md](../models/habit.md)
- [habit-log.md](../models/habit-log.md)
