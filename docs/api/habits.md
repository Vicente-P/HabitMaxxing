# API — Hábitos

> **Estado local HU-06:** POST de creación y GET de catálogo implementados con pruebas deterministas; formulario/dashboard y aceptación real de persistencia/logout siguen pendientes. No se acredita despliegue ni aprobación de seguridad.

---

## Endpoints implementados localmente

| Método y ruta | Contrato |
|---|---|
| `POST /api/habits` | Creación validada, propietario de sesión, cuenta existente, origen exacto configurado y JSON de hasta 8 KiB. [Spec de creación](../specs/habits/create.md) |
| `GET /api/habits?view=catalog` | Todos los hábitos propios, sin filtro diario; 200 `{data: Habit[]}`, vacío permitido, orden `createdAt DESC, id ASC`. [Spec de catálogo](../specs/habits/list.md#catálogo-implementado--hu-06--scrum-11) |

El catálogo acepta únicamente una clave `view=catalog`: parámetros faltantes, repetidos, desconocidos o valores distintos devuelven 400 después de autenticar. Sin identidad válida o con cuenta eliminada: 401. Fallos internos: 500 neutral. El propietario nunca se acepta desde el cliente y los resultados son privados/sin caché. No incluye logs, relaciones de cuenta ni estado diario.

## Endpoints planeados

### Agenda diaria — HU-09

```
GET /api/habits
```

La agenda diaria y sus parámetros `day`/`date` siguen planificados. Por ahora GET autenticado sin la variante de catálogo devuelve 400; GET anónimo devuelve 401. No se adelantan filtros diarios ni estados de completado.

### Obtener un hábito

```
GET /api/habits/:id
```

### Actualizar hábito

```
PATCH /api/habits/:id
```

### Eliminar hábito

```
DELETE /api/habits/:id
```

---

*Las pruebas reales de PostgreSQL y GET posterior a logout requieren autorización separada; HU-03 sigue pendiente de esa aceptación.*
