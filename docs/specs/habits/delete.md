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

Solo para una solicitud con `Origin` ajeno al configurado (`APP_ORIGIN`), igual que el resto de rutas mutantes de hábitos. No requiere `Content-Type` porque no hay body.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Solicitud no permitida"
  }
}
```

### 404 Not Found

Decisión (HU-08, misma regla que HU-07/HU-10): un hábito de otro usuario responde **404**, byte a byte igual que uno inexistente; ya no se devuelve 403 por propiedad. La plataforma es personal y no debe revelar la existencia de hábitos ajenos.

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

- [x] Eliminar hábito propio retorna 200.
- [x] Tras eliminar el hábito deja de existir (no hay `GET /api/habits/:id`: se verifica con `findById` → null en el contrato y con el 404 de la segunda llamada).
- [x] Tras eliminar, todos los `HabitLog` del hábito se eliminan (cascade).
- [x] Hábito de otro usuario retorna 404 (idéntico al inexistente; sustituye al 403 original).
- [x] Origen ajeno retorna 403 `FORBIDDEN` sin eliminar.
- [x] Modal de confirmación: Cancelar y Escape no envían petición; confirmar envía un único `DELETE`.
- [x] Hábito inexistente retorna 404.
- [x] Sin sesión retorna 401.
- [x] Eliminar el mismo hábito dos veces: segunda llamada retorna 404.

---

## Notas de implementación

- Prisma elimina en cascada `HabitLog` por `@relation(onDelete: Cascade)`.
- El borrado es acotado por propietario: `HabitRepository.delete(habitId, ownerId)` usa `habit.deleteMany({ where: { id, userId } })` y devuelve `false` (nada borrado) si el hábito es ajeno o no existe, lo que produce el 404. No hay lectura previa ni ventana de carrera.
- El modal de confirmación (CA-02) se implementa en frontend, no en API: botón "Eliminar" (icono `trash`, color de peligro) en cada tarjeta de Mis hábitos que abre un `<dialog>` modal con "¿Estás seguro? Esta acción no se puede deshacer", "Cancelar" y "Eliminar". Si se elimina el hábito abierto en modo edición, el formulario vuelve a "Crear hábito".

## Notas de seguridad

- Operación destructiva e irreversible.
- Verificar ownership estrictamente (en la propia escritura, ver arriba).

---

## Modelo relacionado

- [habit.md](../models/habit.md)
- [habit-log.md](../models/habit-log.md)
