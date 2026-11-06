# ADR-05 — Estructura del código: por feature con capas internas

## Estado

Aceptado. La migración es incremental: cada feature se mueve al tocar su próxima historia; no hay migración masiva.

---

## Contexto

El proyecto crece por historias de usuario agrupadas en épicas (EP-01 a EP-05). Hoy la estructura de `src/` es mixta:

- Las route handlers importan Prisma directamente (`src/app/api/habits/route.ts`, `src/app/api/auth/register/route.ts`). Mezclan HTTP, validación y persistencia.
- Hay lógica de dominio en `src/lib/` (`habits.ts`, `login-policy.ts`, `habit-request.ts`) sin una frontera explícita respecto a la infraestructura (`prisma.ts`, `auth.ts`).
- `docs/architecture/overview.md` describe carpetas que no existen (`src/components/`, `src/hooks/`), por lo que la documentación ya se desalineó del código.

Restricciones que condicionan la decisión:

- Next.js App Router fija `src/app/` como capa de entrada (rutas, layouts, route handlers).
- Una sola base de datos (PostgreSQL vía Supabase) y un solo ORM (Prisma, ADR-03).
- Un solo desarrollador y un proyecto de aprendizaje: la ceremonia arquitectónica debe ser proporcional.

---

## Decisión

Organizar `src/` **por feature**, y dentro de cada feature separar en capas internas al estilo Clean/Hexagonal, aplicadas solo donde aportan valor:

```text
src/
├── app/                      # Adaptadores de entrada: pages y route handlers, delgados
├── features/
│   ├── habits/
│   │   ├── domain/           # Reglas puras (horario, racha, validación). Sin Next ni Prisma
│   │   ├── application/      # Casos de uso: createHabit, listDailyHabits
│   │   ├── infrastructure/   # Repositorio Prisma: único módulo que importa prisma
│   │   └── ui/               # Componentes de la feature
│   └── auth/                 # Auth.js como adaptador de infraestructura
└── shared/                   # prisma.ts, átomos de UI del mockup, utilidades genéricas
```

Reglas de dependencia:

1. `domain` no importa de `application`, `infrastructure`, `app` ni de Next/Prisma.
2. `application` depende de `domain` y de **puertos** (interfaces); no conoce Prisma.
3. `infrastructure` implementa los puertos.
4. `app` (route handlers y pages) llama a casos de uso; no importa Prisma.
5. Una feature no importa internals de otra; solo expone su API pública (`index.ts`) o pasa por `shared/`.

Puertos: se introduce un puerto de repositorio para `habits` (necesario para probar casos de uso sin base de datos). No se crea puerto para `auth`, cuyo adaptador (Auth.js) ya está encapsulado.

Documentación en `docs/`, separada por intención:

- `specs/`: qué debe hacer el sistema.
- `architecture/`: cómo está construido, incluidos los ADR.
- `guides/`: cómo operar, probar y desplegar.
- `design/`: sistema visual y mockup.
- `odd/`: progreso de cada feature (temporal, no es fuente de verdad técnica).

Se elimina la duplicación de setup: `docs/guides/setup.md` y `docs/wiki/setup.md` pasan a ser uno solo.

---

## Motivo

- **Cohesión por historia:** cada épica o historia toca una carpeta de feature, no cuatro capas técnicas repartidas.
- **Testeabilidad:** la lógica de dominio y los casos de uso se prueban sin Next ni base de datos.
- **Límites explícitos:** Prisma queda confinado a un módulo, así que cambiar de ORM o de proveedor afecta solo a `infrastructure`.
- **Proporcional:** los puertos se usan donde hay beneficio real, no en todas partes.

---

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|-------------|---------------------|
| **Layered pura** (`controllers/`, `services/`, `repositories/` por tipo técnico) | Dispersa cada feature en varias carpetas; escala mal con 5 épicas |
| **Hexagonal completa en todo el proyecto** | Puertos para cada dependencia es ceremonia excesiva para una sola base de datos y un solo framework |
| **Clean Architecture completa** (entities, interactors, presenters por feature) | Mismo problema que la hexagonal completa, con más capas que mantener |
| **Mantener la estructura actual** | Ya tiene acoplamiento de route handlers con Prisma y documentación desalineada; el costo crece con cada historia |

---

## Consecuencias

✅ Cada historia nueva vive en una feature, con reglas de dependencia verificables.  
✅ Lógica de dominio testeable sin infraestructura.  
✅ Prisma confinado a `infrastructure/`.  
⚠️ Migración con costo: mover archivos y actualizar imports y tests. Se hace por feature, al tocar historias nuevas, no en un solo cambio masivo.  
✅ Las reglas de dependencia se vigilan con `no-restricted-imports` en `eslint.config.mjs` (sin dependencias nuevas). Las features se detectan solas desde `src/features/`. Si la lista de patrones se vuelve engorrosa, evaluar `eslint-plugin-boundaries`.  
⚠️ La regla cubre `domain/`, `application/` y los imports entre features; `infrastructure/` y `ui/` solo tienen la prohibición entre features, y `src/app` queda libre porque es la capa de composición.  
⚠️ Durante la transición coexisten dos estilos; documentar en `architecture/overview.md` qué features ya migraron.  
⚠️ `docs/architecture/overview.md` debe actualizarse para reflejar la estructura real, antes o junto con la aceptación de este ADR.
