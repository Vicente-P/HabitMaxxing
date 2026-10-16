# Design System — HabitMaxxing

> **Fuente de verdad visual:** el mockup "Habit Maxxing — Prototipo" (Claude Design).
> Copia de referencia versionada en [`docs/design/mockup/`](../design/mockup/README.md).
> Este documento resume las reglas de implementación; ante cualquier duda, el mockup manda.
>
> **Estado:** tokens, tipografía y clases de componente del mockup integrados en `src/app/globals.css`.

## Regla principal para agentes

- Implementa el frontend siguiendo la estructura del mockup de forma estricta: mismos tokens, mismos componentes, misma jerarquía tipográfica y mismo tema por defecto.
- Si algo no coincide con el mockup, **no lo decidas tú**: detén el cambio y consulta al usuario como excepción, indicando qué difiere, por qué y qué alternativa propones.
- Nunca escribas colores hex, tamaños o radios sueltos en componentes. Usa únicamente tokens `--hm-*` (ver abajo).
- Nunca uses colores por defecto de Tailwind (`zinc-*`, `gray-*`, `white`, `black`) en la UI de la app.
- No uses `dark:` ni `light:`: el tema lo resuelven los tokens. El tema oscuro es el predeterminado y el claro se activa con `.hm-light` o `[data-hm-theme="light"]`.
- `pnpm lint` falla si encuentra en `src/` colores hex, colores por defecto (`zinc-N`, `gray-N`, `brand-N`, `white`, `black`) o variantes `dark:`/`light:`. La regla vive en `eslint.config.mjs`.
- Los estilos inline de color o tipografía están prohibidos. El mockup los usa para leer variables; aquí se traducen a clases.

Excepciones y decisiones de traducción del mockup al repo: [`docs/design/mockup/README.md`](../design/mockup/README.md#traducción-al-repo).

---

## Personalidad visual

- Minimalista moderno, con acento violeta y superficies casi negras con sutil tinte violeta.
- Tipografía sans-serif (Inter) con jerarquía de 28/20/15/13/11 px. JetBrains Mono está disponible para datos numéricos.
- Bordes sutiles (8 % de opacidad), espaciado generoso.

---

## Arquitectura de estilos

| Archivo | Rol |
|---------|-----|
| `docs/design/mockup/tokens.css` | Tokens exactos del mockup (referencia) |
| `src/app/globals.css` | Tokens `--hm-*` en `:root`, mapeo a `@theme` y clases de componente |
| `src/app/layout.tsx` | Carga de Inter (`--font-inter`) y JetBrains Mono (`--font-jetbrains-mono`), `<html lang="es">` |
| `postcss.config.mjs` | Plugin `@tailwindcss/postcss` |

No existe `tailwind.config.ts`. Tailwind CSS 4 usa configuración CSS-first.

---

## Tokens

### Acento y semánticos

| Token | Valor (dark por defecto) | Clase de ejemplo |
|-------|--------------------------|------------------|
| `--hm-accent` | `#7C3AED` | `bg-hm-accent` |
| `--hm-accent-hi` (hover) | `#8B5CF6` | `hover:bg-hm-accent-hi` |
| `--hm-accent-lo` (pressed) | `#5B21B6` | `active:bg-hm-accent-lo` |
| `--hm-on-accent` | `#FFFFFF` | `text-hm-on-accent` |
| `--hm-success` | `#10B981` | `text-hm-success` |
| `--hm-warn` | `#F59E0B` | `text-hm-warn` |
| `--hm-danger` | `#F43F5E` | `text-hm-danger` |

Fondos suaves: `--hm-accent-soft`, `--hm-success-soft`, `--hm-warn-soft`, `--hm-danger-soft`.

### Superficies y texto

Dark (predeterminado):

| Token | Valor |
|-------|-------|
| `--hm-bg` / `--hm-surface` / `--hm-surface-2` / `--hm-surface-3` | `#0F0F11` / `#1A1A1F` / `#25252C` / `#2D2D35` |
| `--hm-border` / `--hm-border-hi` / `--hm-border-lo` | `rgba(255,255,255,.08 / .16 / .05)` |
| `--hm-text-hi` / `--hm-text` / `--hm-text-mid` / `--hm-text-low` / `--hm-text-dim` | `#FAFAFA` / `#E4E4E7` / `#A1A1AA` / `#71717A` / `#52525B` |

Light (`.hm-light`): valores definidos en `docs/design/mockup/tokens.css`.

### Heatmap

`--hm-heat-0` … `--hm-heat-4`, de vacío a acento pleno. Usa `bg-hm-heat-N`.

### Tipografía

| Clase | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `text-hm-h1` | 28px, lh 1.15, tracking -0.02em | 600 | Título de página (`h1`) |
| `text-hm-h2` | 20px, lh 1.2 | 600 | Sección (`h2`) |
| `text-hm-body` | 15px, lh 1.6 | 400 | Cuerpo |
| `text-hm-caption` | 13px, lh 1.5 | 400 | Descripciones, ayudas, errores |
| `text-hm-overline` | 11px, uppercase, tracking 0.08em | 600 | Etiquetas de sección |

Los elementos `h1`, `h2`, `h3` y `h4` reciben estilos base en `@layer base`.

### Radios

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-hm-sm` | 8px | Inputs, botones secundarios |
| `rounded-hm-md` | 10px | Botón primario |
| `rounded-hm-lg` | 12px | Cards |
| `rounded-hm-xl` | 16px | Modales |

### Sombras

`shadow-hm-glow` para el resplandor del botón primario.

---

## Componentes

Definidos en `@layer components` de `globals.css`, con sus valores tomados del mockup.

| Clase | Uso |
|-------|-----|
| `.page-container` | Contenedor centrado de página |
| `.card` | Superficie con borde sutil |
| `.btn-primary` | Acción principal (acento, texto `hm-on-accent`) |
| `.btn-secondary` | Acción secundaria (borde, texto medio) |
| `.label` | Etiqueta de campo |
| `.input` / `.input-error` | Campo de texto y estado de error |
| `.field-error` | Mensaje de error bajo un campo |
| `.badge-neutral` | Etiqueta neutra (días, estados) |
| `.badge-success` | Estado completado (verde suave) |

Átomos del mockup sin clase todavía (`HabitCheck`, `StreakBadge`, `Heatmap`, `YearHeatmap`, `WeekDots`, `ProgressBar`, `ProgressRing`, `Sparkline`, `HabitIcon`): se implementan cuando la historia correspondiente los necesite, siguiendo `docs/design/mockup/atoms.jsx`.

---

## Pantallas de referencia

| Archivo del mockup | Contenido |
|--------------------|-----------|
| `docs/design/mockup/ios-frame.jsx` | Marco de dispositivo iOS para vistas móviles |
| `docs/design/mockup/desktop-dashboards.jsx` | Dashboards desktop (Dense, Quiet, Vibrant) |
| `docs/design/mockup/desktop-habit-screens.jsx` | Detalle de hábito y creación en desktop |
| `docs/design/mockup/mobile-screens.jsx` | Pantallas móviles, barra de pestañas |
| `docs/design/mockup/app.jsx` | Composición de la app |

---

## Excepciones

Antes de implementar algo que no esté en el mockup, consulta al usuario. Una excepción aprobada se registra en el feature doc de la historia (`odd/tasks/`) con su motivo, y no se generaliza a otras pantallas.

---

## Checklist pre-entrega

```
□ ¿Usé solo tokens --hm-* y clases de este documento (sin hex ni colores por defecto)?
□ ¿Los textos usan text-hm-h1/h2/body/caption/overline?
□ ¿Los botones usan .btn-primary o .btn-secondary?
□ ¿Los campos usan .label, .input y .field-error?
□ ¿Las cards usan .card?
□ ¿Cualquier desviación del mockup fue consultada y aprobada?
□ ¿pnpm typecheck && pnpm lint && pnpm exec vitest run && pnpm build pasan?
```

---

## Referencias

- Mockup (fuente de verdad): https://claude.ai/artifact/TRXGZovYXH5eeMhkJ8D9rS
- Copia versionada: [`docs/design/mockup/`](../design/mockup/README.md)
- Implementación: `src/app/globals.css`, `src/app/layout.tsx`
- Convenciones técnicas: `docs/specs/SPEC_CONVENTIONS.md`
- Toggle de tema (pendiente): backlog SCRUM-21
