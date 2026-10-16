# Feature: design-system-mockup

## Objective

Reemplazar por completo el design system actual por el del mockup de Claude Design ("Habit Maxxing — Prototipo"), y dejar la regla de que los agentes implementen el frontend siguiendo ese mockup de forma estricta. Cualquier desviación se consulta con el usuario como excepción.

## Problem

`docs/specs/DESIGN_SYSTEM.md` y `src/app/globals.css` definen tokens (`brand-*`, `light-*`, `dark-*`), radios y clases de componente distintos de los del mockup. El mockup usa tokens `--hm-*`, tema oscuro por defecto y átomos propios. Sin una fuente única, los agentes implementan con el sistema viejo.

## Why

El usuario decidió que el mockup reemplaza el sistema actual en lugar de convivir con él (decisión registrada en la conversación del 2026-10-16). Hace falta una referencia versionada, porque el artifact vive fuera del repo y los agentes no pueden depender de su URL.

## Scope

Dentro:
- Tokens del mockup (`docs/design/mockup/tokens.css`) como fuente de `src/app/globals.css`.
- Clases de componente del mockup reflejadas como utilidades/clases Tailwind que sólo usan tokens.
- Migración de las pantallas existentes: login, registro, dashboard (catálogo y formulario de creación), botón de cierre de sesión y landing de plantilla.
- Layout: fuente Inter y JetBrains Mono, `lang="es"`, tema oscuro por defecto.
- Reescritura de `docs/specs/DESIGN_SYSTEM.md` como documento de reglas que apunta al mockup.
- Regla en `AGENTS.md` sobre fuente de verdad visual y excepciones.
- Copia de referencia del mockup en `docs/design/mockup/`.

Fuera:
- Pantallas nuevas del mockup que no existen en la app (detalle de hábito, estadísticas, onboarding, vista de año). Pertenecen a historias futuras.
- Toggle de tema (SCRUM-21). Sólo se fija el tema oscuro por defecto.
- Cambios de lógica, validaciones, API o autenticación.
- Archivo `prisma.config.ts` modificado en el working tree antes de este feature. No se incluye en ningún commit.

## Constraints

- Brownfield: se mantienen Tailwind CSS 4 con configuración CSS-first, Next.js App Router y los tests existentes.
- Ningún color, radio o tamaño tipográfico en hex o en valores sueltos dentro de componentes; siempre tokens `--hm-*`.
- Las pruebas existentes verifican roles, textos y comportamiento, no clases; deben seguir pasando sin cambios de lógica.
- Cero commits de `prisma.config.ts`.

## Decisions taken without the user (to be disclosed)

- Las propiedades inline del mockup se traducen a utilidades Tailwind que leen tokens, en lugar de portar `style={{}}`. Motivo: el repo no usa estilos inline y el mockup sólo los usa para leer variables.
- Se agrega un token `--hm-on-accent: #FFFFFF`, porque el mockup escribe `#fff` literal en botones y checks y no hay token para ese texto.
- Los estilos de input y de select no tienen definición explícita en el mockup. Se derivan de sus patrones (superficie, borde `--hm-border`, radio sm, foco con acento). Si difieren, se consulta.

## Checklist

- [x] T-01 Crear rama `feature/design-system-mockup` desde `develop`.
- [x] T-02 Copiar tokens y fuentes de referencia del mockup a `docs/design/mockup/`.
- [x] T-03 Reescribir `src/app/globals.css` con tokens `--hm-*`, tema oscuro por defecto y clases de componente del mockup.
- [x] T-04 Actualizar `src/app/layout.tsx`: JetBrains Mono y clases de tema.
- [x] T-05 Migrar `(auth)/login` y `(auth)/register` a las clases nuevas (no requirieron cambios: ya usaban `.input`, `.label`, `.btn-primary`, `.field-error`).
- [x] T-06 Migrar `(dashboard)/dashboard/page.tsx`, `habit-catalog.tsx`, `create-habit-form.tsx` y `logout-button.tsx`. La página de dashboard no requirió cambios.
- [x] T-07 Restilizar la landing `src/app/page.tsx` sólo con tokens; el texto de plantilla no cambia en esta historia.
- [x] T-08 Reescribir `docs/specs/DESIGN_SYSTEM.md` como reglas que apuntan al mockup.
- [x] T-09 Agregar la regla de fuente de verdad visual y excepciones a `AGENTS.md`, fuera del bloque administrado por BMad.
- [x] T-10 Documentar `docs/design/mockup/README.md` con origen, fecha y alcance.
- [x] T-11 Verificar: `pnpm exec vitest run` (238/238), `pnpm typecheck`, `pnpm lint` (exit 0 tras excluir `docs/design/mockup/**`) y `pnpm build` (compila, 9 rutas).
- [ ] T-12 Revisión visual de login, registro y dashboard en 320 px y en tema oscuro. Pendiente.

## Acceptance criteria

- Ninguna clase del sistema anterior (`brand-*`, `light-*`, `dark-*`, `zinc-*`, `btn-*` con colores viejos) queda en `src/`.
- Todas las pantallas existentes usan sólo tokens `--hm-*`.
- Las pruebas existentes pasan sin cambios de aserción.
- `docs/specs/DESIGN_SYSTEM.md` declara el mockup como fuente de verdad.
- `AGENTS.md` contiene la regla de excepciones.

## Route

Delegated direct según el protocolo ODD (2+ archivos no triviales). Se ejecuta inline porque el harness sólo permite delegar a subagentes cuando el usuario lo pide explícitamente. Registrado aquí para que la desviación sea visible.

## Progress and evidence

- T-01 y T-02 hechos. Rama `feature/design-system-mockup` creada desde `develop` en `c62d505`.
- Alcance medido: 6 archivos de UI con clases del sistema (`login`, `register`, `dashboard/page`, `habit-catalog`, `create-habit-form`, `logout-button`) más `globals.css`, `layout.tsx` y la landing.
- Ningún test referencia clases CSS (`rg className` en `*.test.*` sin resultados).

- Lint: los `.jsx` de referencia del mockup hacían fallar ESLint (`react/jsx-no-undef` y 14 warnings). Se excluyeron con `docs/design/mockup/**` en `eslint.config.mjs`.
- Ruta de decisiones: ver `docs/design/mockup/README.md#traducción-al-repo`.

## Next step

T-12: revisión visual en navegador (320 px y 1280 px) de login, registro y dashboard. Después, commits por unidad de trabajo y revisión nativa si RDD la exige.
