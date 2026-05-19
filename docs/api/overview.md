# API — Visión General

## Tabla de contenidos

- [Descripción](#descripción)
- [URL base](#url-base)
- [Autenticación](#autenticación)
- [Formato de respuesta](#formato-de-respuesta)
- [Códigos de error](#códigos-de-error)
- [Endpoints disponibles](#endpoints-disponibles)

---

## Descripción

Habit Maxxing expone una API REST construida con **Next.js Route Handlers** (App Router). Todos los endpoints siguen el patrón `/api/[recurso]/[id?]/[acción?]`.

---

## URL base

```
Desarrollo:  http://localhost:3000/api
Producción:  https://[dominio-vercel].vercel.app/api  (pendiente)
```

---

## Autenticación

La API usa **sesiones basadas en cookies** manejadas por Auth.js. No se usa autenticación por API key ni tokens Bearer.

Para acceder a endpoints protegidos, el cliente debe tener una sesión activa. Las rutas sin sesión retornan `401 Unauthorized`.

---

## Formato de respuesta

### Respuesta exitosa

```json
{
  "data": { ... }
}
```

### Respuesta de error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo email es requerido",
    "details": [ ... ]
  }
}
```

---

## Códigos de error

| Código HTTP | Significado |
|-------------|-------------|
| `400` | Datos de entrada inválidos (error de validación Zod) |
| `401` | No autenticado — sesión inexistente o expirada |
| `403` | Autenticado pero sin permisos sobre el recurso |
| `404` | Recurso no encontrado |
| `409` | Conflicto — ej: email ya registrado |
| `500` | Error interno del servidor |

---

## Endpoints disponibles

| Módulo | Documento | Estado |
|--------|-----------|--------|
| Autenticación | [auth.md](./auth.md) | 🔄 En desarrollo |
| Hábitos | [habits.md](./habits.md) | 🔲 Pendiente |
| Registros y estadísticas | [logs.md](./logs.md) | 🔲 Pendiente |
