# ADR-06 — Tests de integración contra PostgreSQL y contrato del repositorio

## Estado

Propuesto. Cambia tooling (dependencias de desarrollo, configuración de Vitest y CI), por lo que requiere aprobación explícita antes de implementarse. Ninguna tarea de este plan está ejecutada.

---

## Contexto

Los tests de las rutas de API y de la aplicación usan dos dobles: `prisma` mockeado y `InMemoryHabitRepository`. Prueban que el código llama bien a los dobles, no que PostgreSQL se comporte como asumimos. Quedan sin cobertura automática:

- La restricción `@@unique([habitId, date])` y el upsert por clave compuesta `habitId_date`.
- El tipo `@db.Date` (ida y vuelta de `YYYY-MM-DD` sin corrimiento de zona horaria).
- El filtro `frequency: { has: day }` sobre `Int[]`.
- El orden `createdAt desc, id asc` y el filtro por propietario.
- Los borrados en cascada (`User → Habit → HabitLog`), críticos para HU-08 y HU-05.

Además, nada garantiza que `InMemoryHabitRepository` y `createPrismaHabitRepository` cumplan el mismo contrato: pueden divergir sin que ningún test falle.

`createPrismaHabitRepository(database)` ya recibe el cliente por parámetro, así que se puede probar contra una base real sin tocar el código de producción.

---

## Decisión

1. **Suite de contrato compartida del `HabitRepository`.** Un único archivo de casos que se ejecuta contra el repositorio en memoria (unitario) y contra el adaptador de Prisma sobre PostgreSQL real (integración).
2. **Proyecto de Vitest `integration`** separado del unitario: archivos `*.integration.test.ts`, entorno `node`, ejecución secuencial. El comando `pnpm exec vitest run` actual no cambia ni exige Docker; las pruebas de integración se ejecutan con `pnpm test:integration`.
3. **Base de datos efímera:**
   - Local: PostgreSQL en contenedor con Testcontainers (nueva devDependency `@testcontainers/postgresql`; requiere Docker).
   - CI: servicio `postgres` del workflow. Si existe `TEST_DATABASE_URL`, se usa esa y no se crea contenedor.
   - Las migraciones se aplican con `prisma migrate deploy` antes de la suite.
4. **Salvaguarda obligatoria contra datos reales.** `prisma.config.ts` carga `.env` con `dotenv`, y `DIRECT_URL` puede apuntar a Supabase. La suite no usa esas variables: lee solo `TEST_DATABASE_URL` y aborta si el host no es `localhost`/`127.0.0.1` o si el nombre de la base no contiene `test`. Un test de la salvaguarda cubre el aborto.
5. **Aislamiento:** `TRUNCATE ... RESTART IDENTITY CASCADE` de `HabitLog`, `Habit` y `User` en cada `beforeEach`; usuarios creados por fixtures.

### Alternativas descartadas

- **Mockear mejor a Prisma:** no prueba SQL ni restricciones.
- **SQLite o pg-mem:** distinto motor; no reproduce `Int[]`, `@db.Date` ni los operadores usados.
- **Usar una base de Supabase de pruebas:** red, credenciales en CI, estado compartido y riesgo de tocar datos reales.

---

## Plan de implementación

Cada tarea es un commit revisable. Total estimado: 350–450 líneas, entre código, configuración y documentación.

| ID | Tarea | Resultado verificable |
|----|-------|------------------------|
| T1 | Mover los casos del repositorio a `habit-repository.contract.ts` (función `describeHabitRepositoryContract(name, factory)`) y ejecutarlos contra `InMemoryHabitRepository` | La suite en memoria pasa; sin cambio de comportamiento |
| T2 | Proyecto `integration` de Vitest, script `test:integration`, `globalSetup` (contenedor o `TEST_DATABASE_URL`, `migrate deploy`) y salvaguarda de host/nombre | La salvaguarda aborta con una URL no local o sin `test` en el nombre |
| T3 | `prisma-habit-repository.integration.test.ts`: la suite de contrato contra Prisma/PostgreSQL | Contrato idéntico pasa en ambos repositorios |
| T4 | Casos solo-base de datos: unicidad `(habitId, date)`, cascada de `User → Habit → HabitLog`, ida y vuelta de `@db.Date`, `has` sobre `Int[]` | Cada caso falla si se rompe la restricción o la consulta correspondiente |
| T5 | CI: job separado `integration` con servicio PostgreSQL y `prisma migrate deploy` | Job verde en GitHub Actions (hoy bloqueado por facturación; ver Riesgos) |
| T6 | Documentación: `docs/guides/testing.md`, `docs/guides/ci-cd.md`, `docs/guides/setup.md`; estado de este ADR a "Aceptado" | Guías alineadas con los comandos reales |

### Casos del contrato (T1/T3)

- `create` devuelve el hábito con propietario y unidad nula para binarios.
- `listByOwner` filtra por propietario y ordena `createdAt desc, id asc` (desempate con mismo `createdAt`).
- `listScheduledForDay` filtra por día de la semana (domingo = 0), adjunta solo el log de `logDate` y mantiene el orden.
- `findById` devuelve el hábito de otro propietario (la comprobación de propiedad es del caso de uso) y `null` si no existe.
- `upsertBinaryLog`: crea, actualiza el mismo registro al revertir (`completed: false`), nunca borra, una fila por hábito y día.
- `upsertNumericLog`: crea con `completed: true`, el segundo valor del día reemplaza al primero.
- La fecha vuelve como `YYYY-MM-DD` sin corrimiento.

### Verificación del plan

- Las dos implementaciones pasan la misma suite.
- **Prueba de que aporta valor:** introducir a propósito un defecto en el adaptador (quitar el filtro por propietario de `listByOwner`, o cambiar `habitId_date`) y comprobar que la suite de integración falla mientras los tests con mocks siguen pasando. Se revierte el defecto después.
- `pnpm exec vitest run`, `pnpm typecheck`, `pnpm lint`, `pnpm build` y `pnpm test:integration` pasan.

---

## Riesgos

- **Datos reales (ítem alto: datos):** una suite que trunca tablas contra una URL equivocada destruiría datos. Mitigación: salvaguarda de la decisión 4, con test propio.
- **Entorno (ítem alto: CI y dependencias):** agrega una devDependency y un job. El CI de GitHub está bloqueado por facturación, así que T5 no se podrá verificar en remoto hasta resolverlo; se valida el mismo flujo en local.
- **Docker obligatorio para correr la integración en local.** Se acepta: el comando unitario sigue sin requerirlo.
- **Versión de PostgreSQL:** usar la misma versión mayor que Supabase. Verificarla antes de T2 y fijarla en un solo lugar.

## Decisiones abiertas

1. Testcontainers (más cómodo, requiere Docker y una dependencia) frente a una URL de prueba por `docker compose` (sin dependencia nueva). Recomendación: Testcontainers en local y servicio en CI.
2. Si `pnpm test:integration` debe bloquear el merge (check requerido) o ser informativo al inicio.
