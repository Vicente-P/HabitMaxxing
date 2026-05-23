# Endpoint: Crear hábito

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-11](https://vperezc18.atlassian.net/browse/SCRUM-11) / HU-06 |
| **Épica** | SCRUM-2 / EP-02 — Gestión de Hábitos |
| **Story Points** | 3 |
| **Autenticación** | Sí requerida |

## Descripción

Crea un nuevo hábito para el usuario autenticado. Soporta hábitos binarios y numéricos con frecuencia semanal configurable.

---

## Request

```
POST /api/habits
```

### Headers

| Header | Valor | Requerido |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Sí |
| Cookie | Sesión Auth.js | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `name` | `string` | Sí | No vacío, máx. 100 caracteres |
| `type` | `"BINARY"` \| `"NUMERIC"` | Sí | Enum HabitType |
| `unit` | `string` | Condicional | Requerido si `type = NUMERIC`; prohibido si `BINARY` |
| `frequency` | `number[]` | Sí | Array de enteros 0–6, al menos 1 elemento, sin duplicados |

```json
{
  "name": "Correr",
  "type": "NUMERIC",
  "unit": "km",
  "frequency": [1, 3, 5]
}
```

**Ejemplo binario:**

```json
{
  "name": "Meditar 10 minutos",
  "type": "BINARY",
  "frequency": [1, 2, 3, 4, 5]
}
```

---

## Responses

### 201 Created

```json
{
  "data": {
    "id": "clx7k2m9n0001qz8f3hab5678",
    "name": "Correr",
    "type": "NUMERIC",
    "unit": "km",
    "frequency": [1, 3, 5],
    "userId": "clx7k2m9n0000qz8f3abc1234",
    "createdAt": "2026-05-22T11:00:00.000Z",
    "updatedAt": "2026-05-22T11:00:00.000Z"
  }
}
```

### 400 Bad Request — Validación

**Nombre vacío:**

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

**Sin días seleccionados:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "frequency",
        "message": "Debes seleccionar al menos un día"
      }
    ]
  }
}
```

**NUMERIC sin unit:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "unit",
        "message": "La unidad es obligatoria para hábitos numéricos"
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

- **CA-01:** Dado que quiero crear un hábito, cuando ingreso nombre, tipo (binario o numérico) y selecciono los días de la semana, entonces el hábito aparece en mi dashboard.
- **CA-02:** Dado que creo un hábito numérico, cuando lo configuro, entonces debo poder especificar la unidad de medida (km, páginas, vasos, etc).
- **CA-03:** Dado que intento crear un hábito, cuando dejo el nombre vacío, entonces veo "El nombre del hábito es obligatorio".
- **CA-04:** Dado que creo un hábito, cuando no selecciono ningún día de la semana, entonces veo "Debes seleccionar al menos un día".

---

## Tests requeridos

- [ ] Crear hábito binario válido retorna 201 con `unit: null`.
- [ ] Crear hábito numérico válido retorna 201 con `unit` especificado.
- [ ] Nombre vacío retorna 400 con mensaje obligatorio.
- [ ] `frequency` vacío retorna 400 con mensaje de al menos un día.
- [ ] `frequency` con valores fuera de 0–6 retorna 400.
- [ ] `type = NUMERIC` sin `unit` retorna 400.
- [ ] `type = BINARY` con `unit` retorna 400 o ignora unit.
- [ ] Sin sesión retorna 401.
- [ ] Hábito creado pertenece al `userId` de la sesión activa.

---

## Notas de implementación

- Obtener `userId` de `auth()` — nunca confiar en userId del body.
- Schema Zod: `createHabitSchema` en `src/lib/validations.ts`.
- Ordenar `frequency` ascendente antes de persistir (opcional, consistencia).

## Notas de seguridad

- Verificar sesión activa antes de crear.
- Sanitizar `name` y `unit` (trim, longitud máxima).

---

## Modelo relacionado

- [habit.md](../models/habit.md)
