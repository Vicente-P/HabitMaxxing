<!-- bmad:context -->
<!-- Verificado 2026-10-04 contra 8b38ca8a5c8c33e8877b1ba232cfb572023d76f2. Administrado por bmad-project-context; los cambios dentro de este bloque se reemplazan al actualizarlo. Conserva fuera de los marcadores cualquier instrucción manual. -->

## HabitMaxxing

Aplicación brownfield de seguimiento de hábitos construida con Next.js, TypeScript, Prisma y PostgreSQL. El backlog está en `docs/wiki/backlog.md`; los contratos funcionales y visuales están en `docs/specs/`; las decisiones técnicas están en `docs/architecture/`.

## Política

- Trata este repositorio como brownfield: conserva las decisiones existentes y propone explícitamente cualquier cambio de stack, arquitectura, modelo de datos, tooling o convenciones.
- Mantén requisitos, decisiones y conocimiento durable en archivos versionados; no conviertas el chat en fuente de verdad.
- No dupliques documentación para ajustarla a BMad; referencia y actualiza la fuente existente.
- No edites manualmente `src/generated/prisma/`; regenera el cliente mediante Prisma.
- No edites `_bmad/scripts/`; coloca personalizaciones en `_bmad/custom/` y aplica `bmad setup`.

## Dónde están las cosas

- Backlog, épicas, historias y criterios de aceptación: `docs/wiki/backlog.md`.
- Contratos de autenticación, hábitos, registros y modelos: `docs/specs/`.
- Sistema visual: `docs/specs/DESIGN_SYSTEM.md`.
- Arquitectura, autenticación, persistencia y ADRs: `docs/architecture/`.
- Setup, testing, contribución, CI y despliegue: `docs/guides/`.
- Modelo de datos: `prisma/schema.prisma`.
- Runtime y configuración de BMad: `_bmad/`.

## Ejecución y verificación

- Usa Node.js 22 y pnpm 11; el package manager fijado es `pnpm@11.1.3`.
- Para una ejecución no interactiva de tests usa `pnpm exec vitest run`; `pnpm test` inicia Vitest en modo watch.
- Antes de cerrar un cambio ejecuta los checks aplicables definidos en `package.json` y `.github/workflows/ci.yml`.

## Convenciones diferentes del valor predeterminado

- Para comportamiento deseado, consulta primero el backlog y la spec correspondiente; para comportamiento actualmente implementado, verifica código y tests.
- Cuando una spec y la implementación diverjan, no asumas cuál está correcta: registra la discrepancia y resuélvela dentro del cambio autorizado.
- Haz que BMad consuma los artefactos existentes; no regeneres PRDs, arquitectura o diseño sin una carencia concreta.

## Riesgos conocidos

- Las tablas de características del `README.md` describen parte del alcance objetivo y no prueban que una funcionalidad esté implementada; verifica siempre el código y los tests.

<!-- /bmad:context -->
