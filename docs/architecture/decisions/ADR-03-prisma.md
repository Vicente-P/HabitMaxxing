# ADR-03 — ORM: Prisma 7

## Estado

Aceptado

---

## Contexto

La aplicación necesita una capa de acceso a datos que provea tipado TypeScript completo, un sistema de migraciones versionado y una experiencia de desarrollo ágil. El schema de datos incluye relaciones entre User, Habit y HabitLog con constraints y tipos específicos de PostgreSQL.

---

## Decisión

Usar **Prisma 7** como ORM, con `prisma.config.ts` para la gestión de la URL de conexión (patrón Prisma 7).

---

## Motivo

- **Tipado end-to-end:** Prisma genera tipos TypeScript directamente desde el schema. Cualquier query tiene tipos inferidos automáticamente, eliminando una categoría entera de bugs en runtime.
- **Sistema de migraciones:** `prisma migrate dev` genera y aplica SQL versionado. El historial de migraciones en `prisma/migrations/` sirve como documentación del estado de la base de datos a lo largo del tiempo.
- **Prisma Studio:** GUI visual para explorar y editar datos durante el desarrollo, sin necesidad de herramientas externas.
- **`prisma.config.ts` en v7:** Separa la URL de conexión del schema — el schema define solo la estructura, la configuración de runtime vive en un archivo dedicado.
- **Output customizable:** El cliente se genera en `src/generated/prisma` en vez de `node_modules`, lo que lo hace parte explícita del proyecto.

---

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|------------|---------------------|
| **Drizzle ORM** | Más verbose, sin sistema de migraciones tan maduro, requiere más configuración manual |
| **Kysely** | Query builder de bajo nivel; requiere escribir más SQL manual, menos abstracciones |
| **pg directo** | Sin tipado automático ni sistema de migraciones; toda la seguridad de tipos debe mantenerse a mano |
| **TypeORM** | API basada en decoradores, configuración más compleja, menor alineación con el ecosistema moderno de Next.js |

---

## Consecuencias

✅ Types generados automáticamente — cambiar el schema actualiza los types en toda la aplicación.  
✅ Migraciones SQL versionadas y reproducibles.  
✅ Prisma Studio disponible como herramienta de exploración de datos.  
✅ Soporte para tipos específicos de PostgreSQL como `@db.Date` e `Int[]`.  
⚠️ El cliente generado (`src/generated/prisma`) debe regenerarse con `pnpm dlx prisma generate` después de cada cambio de schema — `migrate dev` no lo hace automáticamente en Prisma 7.  
⚠️ Prisma 7 introduce cambios breaking respecto a v6 (especialmente en `prisma.config.ts`).
