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
| `Origin` | Origen exacto configurado en `APP_ORIGIN` | Sí |

### Body

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `name` | `string` | Sí | Recorte de espacios externos, 1–100 caracteres |
| `type` | `"BINARY"` \| `"NUMERIC"` | Sí | Enum HabitType |
| `unit` | `string` | Condicional | NUMERIC: recorte de espacios externos, 1–30 caracteres; BINARY: omitir la clave, rechazar incluso `null` |
| `frequency` | `number[]` | Sí | Entre 1 y 7 enteros 0–6, sin duplicados ni coerción; persistencia ascendente |

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

- [x] Crear hábito binario válido retorna 201 con `unit: null`.
- [x] Crear hábito numérico válido retorna 201 con `unit` especificado.
- [x] Nombre vacío retorna 400 con mensaje obligatorio.
- [x] `frequency` vacío retorna 400 con mensaje de al menos un día.
- [x] `frequency` con valores fuera de 0–6 retorna 400: POST autenticado BINARY con `[7]` confirmó `VALIDATION_ERROR`, sin insertar (delta real aislado).
- [x] `type = NUMERIC` sin `unit` retorna 400: POST autenticado NUMERIC con `[0]` y clave `unit` omitida confirmó `VALIDATION_ERROR`, sin insertar (delta real aislado).
- [x] `type = BINARY` con `unit` retorna 400, incluso con `null`.
- [x] Sin sesión retorna 401.
- [x] Hábito creado pertenece al `userId` de la sesión activa.

---

## Notas de implementación

- Obtener `userId` de `auth()` — nunca confiar en userId del body.
- Schema Zod: `createHabitSchema` en `src/lib/validations.ts`.
- Ordenar `frequency` ascendente después de validar, antes de persistir (obligatorio).

## Notas de seguridad

- Verificar sesión activa antes de crear.
- Validar texto con recorte de espacios externos y límites; no interpretar HTML. La UI lo renderiza como texto.

---

## Modelo relacionado

- [habit.md](../models/habit.md)

## Contrato de protección HU06-01

- Rechazar todas las claves desconocidas, incluidos `userId`, IDs y fechas. No convertir tipos de datos automáticamente. El propietario se obtiene exclusivamente de la sesión.
- Autenticar antes de inspeccionar origen, media type o cuerpo. Identidad ausente/vacía o cuenta eliminada: 401. Consultar existencia con selección de `id` exclusivamente; fallos de autenticación, consulta o inserción: 500 neutral.
- Comparar un único `Origin` canónico con `APP_ORIGIN`, configurado en servidor. Nunca inferirlo de `Host`, cabeceras reenviadas o URL de la solicitud. Origen ausente, `null`, extranjero, múltiple o no canónico: 403 (`FORBIDDEN`). Configuración ausente/inválida: 500 (`INTERNAL_ERROR`).
- Aceptar `application/json`, opcionalmente `charset=utf-8`; otros formatos: 415 (`UNSUPPORTED_MEDIA_TYPE`). Cuerpo máximo: 8192 bytes reales, leído por streaming, con cancelación al exceder; `Content-Length` solo permite rechazo anticipado. Exceso: 413 (`PAYLOAD_TOO_LARGE`). JSON vacío, malformado, UTF-8 inválido o no objeto: 400 (`VALIDATION_ERROR`).
- Todos los resultados del handler llevan `Cache-Control: private, no-store`. El DTO incluye únicamente campos escalares del hábito, sin relaciones ni información de cuenta. No registrar cuerpos, cookies, tokens o excepciones internas.
- HU06-01 implementa POST; HU06-02 añade el catálogo `GET /api/habits?view=catalog` y HU06-03 integra formulario y catálogo persistente en el dashboard. La agenda diaria permanece en HU-09. CA-01 y el GET posterior a logout de HU-03 cuentan con aceptación local real aislada del 2026-10-08; no prueba de producción.
- No hay garantía de idempotencia ni revocación de JWT copiados. Un fallo ambiguo después de insertar puede producir duplicados ante reintento manual; no hacer reintentos automáticos.

### Evidencia y límites

Pruebas deterministas con Auth.js/Prisma simulados cubren validación, cuenta ausente/eliminada, propiedad, DTO, errores neutrales, origen exacto, formato, límite de streaming y caché. Por sí solas no equivalen a persistencia/logout real. La aceptación PostgreSQL/navegador local posterior se registra abajo; despliegue y aceptación en producción siguen pendientes, sin aprobación de seguridad.

## Dashboard y formulario — HU06-03

- El guard servidor conserva la exigencia de identidad válida y el logout nativo existente. El cliente carga el catálogo sin caché al montar/revisitar y después de una creación confirmada; no hay self-fetch del servidor ni filtrado por día.
- Formulario con nombre de hasta 100 caracteres, tipo binario/numérico, unidad numérica de hasta 30 caracteres y siete checkboxes semanales nativos. Usa el mismo schema estricto; errores asociados mediante ARIA y foco al primer campo inválido. Cambiar tipo limpia la unidad y un binario no la envía.
- El bloqueo síncrono de envío y controles deshabilitados evitan solicitudes repetidas mientras una creación está pendiente. Solo una respuesta 201 con confirmación válida reinicia el formulario. Errores conservan los valores; transporte ambiguo/500 no implica éxito ni reintento automático y advierte sobre duplicados.
- Creación y lectura son resultados separados: si la creación se confirma pero falla la recarga, se conserva la confirmación y se ofrece reintentar únicamente GET, no volver a crear.
- “Mis hábitos” distingue carga, vacío, error con reintento y sesión no disponible. No conserva tarjetas tras errores/401; cambio de identidad reinicia el estado y cancela lecturas previas. Nombre/unidad se renderizan como texto, no HTML.
- Conserva el orden del servidor y muestra tipo, unidad y días de todos los hábitos, incluidos los no programados para hoy. No muestra completados/pendientes ni adelanta HU-09.

Las pruebas de componentes simulan fetch y verifican teclado, estados, cancelación y guard. Después de autorización separada, el build aislado con Node 22 pasó y la aceptación PostgreSQL/navegador local verificó recarga real y layout de 320 px. El salto inicial de build por red/secretos es histórico, no un bloqueo vigente.
## Aceptación local real — 2026-10-08

HU-06 completa localmente sobre snapshot compilado 9476118, equivalente a la fuente actual: Node 22.23.3, PostgreSQL 18.2, dos migraciones existentes y cuentas sintéticas A/B. Treinta pasos de preparación, comportamiento y limpieza pasaron: tres hábitos persistidos, propiedad aislada, binario 201/unidad nula, numérico normalizado, días [0,6], visibilidad fuera del día tras recarga/revisita y texto literal. El retraso controlado produjo un solo POST/insert; el fallo controlado de catálogo recuperó solo GET. Las validaciones de esta lista cuentan con evidencia determinista; la aceptación real añade rechazos de propietario/unidades/query/origen/formato/tamaño sin inserciones.

Logout Auth.js real terminó en sesión200/null y cookies de sesión ausentes; GET simple/catalog 401 y POST 401 sin insertar, dashboard fresco/directo/Back denegado y aislamiento A/B en ambas direcciones. Teclado Space y captura inspeccionada a 320 px sin recorte. Build aislado exit 0, 238 pruebas y typecheck exit 0; lint de 36 archivos rastreados exit 0. Se conservan fallos históricos del harness/lint no acotado y un aviso act no fallante.

Evidencia: `C:\Users\vpere\.codex\hu06-builds\acceptance-c6ba223\acceptance-readback.md` y campos redactados de `acceptance-edge.json`. Primer Chrome agotó 180 segundos antes de aserciones y registró intentos GCM: no afirmar ausencia de actividad externa. Edge bloqueó 78 solicitudes de fondo y observó cero solicitudes externas de la aplicación; no garantía de aislamiento de red del sistema operativo.

Procesos propios detenidos, sin listeners 3106/55406/55407 y 357 huellas originales sin cambios. HU-09 diario sigue planificado. HU-06 no está desplegada; producción/cuentas/logout no probados, preview APP_ORIGIN pendiente, revisiones nativas omitidas por decisión explícita, sin recibo/aprobación de seguridad ni revocación de JWT copiados.

### Comprobación HTTP suplementaria — 2026-10-08

Los dos casos HTTP específicos pendientes quedaron observados en PostgreSQL/navegador local: BINARY con frecuencia `[7]` y NUMERIC con frecuencia `[0]` sin clave `unit` retornaron 400 `VALIDATION_ERROR`, ambos con `Cache-Control: private, no-store`. Conteo real de hábitos 3→3 y cero filas con los nombres rechazados. La lista requerida queda 9/9 comprobada. Evidencia: `C:\Users\vpere\.codex\hu06-builds\acceptance-c6ba223\acceptance-validation-delta.md` y `acceptance-validation-delta.json`.

Logout real posterior confirmó sesión 200/null y cookies de sesión ausentes; puertos propios detenidos y 357 huellas de aplicación intactas. Este delta es exclusivamente local, sin aprobación nativa/de producción ni nuevas garantías de revocación.
