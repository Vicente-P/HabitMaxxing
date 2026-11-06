# ADR-08 — Registro de hábitos sin conexión

## Estado

**Aceptado** (2026-11-06). El usuario aprobó la decisión completa, incluida la guarda al cerrar sesión con cambios pendientes (§8). Historia: HU-20. Feature de seguimiento: `odd/tasks/hu-20-offline-logging.md`.

---

## Contexto

HU-18 y HU-19 dejaron la app instalable y legible sin conexión. Falta registrar: hoy marcar un hábito sin internet falla con "No se pudo actualizar el hábito".

El endpoint ya sirve para una cola. `POST /api/habits/:id/logs` **fija** el estado del día (`{ completed }` o `{ value }`), hace un upsert por hábito y día y acepta `date` opcional. Reenviar la misma petición produce el mismo resultado, de modo que no se necesita ningún cambio de contrato ni de modelo de datos. (El "toggle" lo calcula la agenda en el cliente.)

Los peligros reales están en el cliente: a qué **día** pertenece un cambio hecho sin conexión, qué pasa si el servidor lo rechaza al sincronizar y qué ocurre con los cambios pendientes al cerrar sesión.

---

## Decisión

1. **Sin cambios en la API ni en Prisma.** Todo vive en el cliente.
2. **Cola en IndexedDB**, sin dependencias nuevas (un wrapper propio pequeño detrás de una interfaz `PendingLogStore`, con una implementación en memoria para los tests unitarios). Un registro por `ownerId + habitId + date`, con `{ payload: { completed } | { value }, queuedAt }`. Una escritura nueva sustituye a la anterior de la misma clave: el último valor gana, y es correcto porque el endpoint es idempotente.
3. **La fecha siempre es explícita** y es la `meta.date` de la agenda que el usuario tenía en pantalla, nunca la que calcule el dispositivo. Así un cambio hecho sin conexión llega al día que el usuario veía, aunque se sincronice mañana.
4. **Solo se encola ante un fallo de red** (la petición no llega al servidor o `navigator.onLine` es falso). Un 4xx o 5xx con respuesta sigue mostrando el error actual.
5. **Salvaguarda de día:** si la agenda guardada es de otro día que el actual (UTC, igual que el servidor), no se permite registrar sin conexión y se avisa "Esta agenda es de {fecha}. Conéctate para registrar hoy". Evita registrar ayer creyendo que es hoy.
6. **Sincronización en primer plano**, secuencial, al abrir la app, al volver la conexión (`online`) y al volver a primer plano (`visibilitychange`). Por cada pendiente:
   - 2xx: se quita de la cola.
   - 400 o 404 (hábito eliminado, día ya no programado, valor inválido): se descarta y se avisa qué cambio no se pudo aplicar.
   - 401: se conserva y se avisa que la sesión terminó; no se reintenta hasta una nueva sesión del mismo usuario.
   - Red o 5xx: se conserva y se reintenta luego.
7. **Interfaz optimista:** el cambio se ve de inmediato con una marca "Pendiente de sincronizar" por hábito y el aviso global muestra cuántos hay. Al terminar de sincronizar se recarga la agenda desde el servidor, que queda como fuente de verdad.
8. **Cierre de sesión:** intenta sincronizar primero; si quedan pendientes, avisa y exige una segunda confirmación explícita para descartarlos. La cola está atada a `ownerId` y jamás se reproduce para otro usuario.
9. **Alcance:** solo el registro de la agenda de hoy (binario y numérico). Crear, editar y eliminar hábitos siguen requiriendo conexión.

### Alternativas descartadas

- **Cambiar el contrato del endpoint:** innecesario, ya es idempotente.
- **Background Sync API del navegador:** sincronizaría con la app cerrada, pero solo existe en Chromium y exige que el service worker lea la cola y reproduzca la petición con la comprobación de origen. Queda como mejora posterior sin cambiar este modelo.
- **Librería de IndexedDB (idb, Dexie):** dependencia nueva para un caso de uso de dos operaciones.
- **localStorage:** sin transacciones, síncrono y con límite pequeño.
- **Descartar los pendientes al cerrar sesión sin avisar:** pérdida silenciosa de datos del usuario.

---

## Riesgos

- **Varios dispositivos:** gana quien sincroniza último, no quien actuó último. Aceptado para un registro personal de un día.
- **Borrado de datos del sitio:** los pendientes se pierden. Es inherente a cualquier almacenamiento local.
- **Día de la agenda:** `utcToday` es la definición que ya usa el servidor; si el producto pasa a zona horaria del usuario, la salvaguarda del punto 5 debe cambiar con ella.
- **Sincronización solo en primer plano:** un cambio pendiente no llega hasta que el usuario vuelve a abrir la app.
