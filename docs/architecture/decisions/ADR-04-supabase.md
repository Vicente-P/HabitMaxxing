# ADR-04 — Base de datos: Supabase (PostgreSQL)

## Estado

Aceptado

---

## Contexto

La aplicación requiere una base de datos PostgreSQL accesible desde un entorno serverless (Vercel). Se necesita una solución con free tier generoso, buena integración con Prisma y bajo overhead de administración.

---

## Decisión

Usar **Supabase** como proveedor de PostgreSQL, conectándose mediante el **Session Pooler** (puerto 5432).

---

## Motivo

- **Free tier generoso:** Supabase ofrece 500 MB de base de datos y hasta 2 proyectos activos en el plan gratuito — suficiente para el MVP y las fases siguientes.
- **PostgreSQL nativo:** A diferencia de alternativas que usan MySQL o bases propietarias, Supabase expone PostgreSQL puro. Esto permite usar todos los tipos específicos que Prisma necesita (`@db.Date`, arrays, etc.).
- **Supabase Studio:** Dashboard visual para explorar datos, ejecutar SQL y ver logs — complementa a Prisma Studio.
- **Connection Pooling incluido:** PgBouncer integrado con Session Pooler e Transaction Pooler sin configuración adicional.
- **Fácil de provisionar:** Base de datos lista en segundos, sin instalación ni mantenimiento.

### Configuración de conexión

Se usa el **Session Pooler** (no el Transaction Pooler ni la conexión directa) por las siguientes razones:

| Tipo | Puerto | IPv4 | Soporta migraciones DDL |
|------|--------|------|--------------------------|
| Transaction Pooler | 6543 | ✅ | ❌ — no soporta DDL |
| **Session Pooler** | **5432** | **✅** | **✅** |
| Direct Connection | 5432 | ❌ (IPv6 only) | ✅ |

La conexión directa es IPv6-only en Supabase, lo que la hace incompatible con redes domésticas IPv4. El Session Pooler resuelve ambas limitaciones.

---

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|------------|---------------------|
| **Neon** | Free tier más restrictivo (compute se suspende); mayor latencia en cold starts |
| **PlanetScale** | Basado en MySQL (no PostgreSQL); incompatible con varios tipos de Prisma usados en el schema |
| **Railway** | Free tier muy limitado (500 horas/mes); costo más alto al escalar |
| **Self-hosted (Docker)** | Requiere infraestructura propia; overhead de mantenimiento innecesario para un proyecto de aprendizaje |

---

## Consecuencias

✅ PostgreSQL completo con todos los tipos nativos disponibles.  
✅ Free tier suficiente para MVP y fases 2 y 3.  
✅ Session Pooler compatible con IPv4 y con migraciones DDL.  
✅ Supabase Studio como herramienta de exploración adicional.  
⚠️ El proyecto queda acoplado a Supabase como proveedor — migrar requeriría actualizar variables de entorno y posiblemente el tipo de conexión.  
⚠️ En el free tier, los proyectos inactivos por más de 7 días se pausan automáticamente.
