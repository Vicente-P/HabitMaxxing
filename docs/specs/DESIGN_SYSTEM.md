# Design System — HabitMaxxing

> Fuente de verdad visual para agentes y desarrolladores.
> **Estado:** integrado en `src/app/globals.css` y `src/app/layout.tsx`.

## Regla principal para agentes

SIEMPRE usa las clases y tokens definidos en este documento.
NUNCA hardcodees colores hex en componentes React.
NUNCA uses estilos inline para colores o tipografía.
SIEMPRE agrega variante `dark:` en elementos de color.

---

## Personalidad visual

- Minimalista moderno (Spotify, GitHub, Linear, Uber).
- Acento: **Violet Purple** (`brand-500` = `#7C3AED`).
- Modo claro y oscuro con variante `dark:`.
- Tipografía sans-serif con jerarquía clara (Inter).
- Cards con bordes sutiles (8% opacidad).
- Espaciado generoso.

---

## Arquitectura de estilos

| Archivo | Rol |
|---------|-----|
| `src/app/globals.css` | Tokens (`@theme`), variantes, clases de componente |
| `src/app/layout.tsx` | Carga de Inter (`--font-inter`) y `<html lang="es">` |
| `postcss.config.mjs` | Plugin `@tailwindcss/postcss` |
| `.vscode/tailwind.css-data.json` | At-rules de Tailwind v4 para el editor |

**No existe** `tailwind.config.ts`. Tailwind CSS 4 usa configuración CSS-first.

### Estructura de `globals.css`

```
@import "tailwindcss"
@custom-variant dark          → dark mode manual con clase .dark
@theme { ... }                → colores, tipografía, radius, spacing, sombras, animaciones
@layer base { ... }           → body, headings h1–h4, transiciones globales
@layer components { ... }     → .card, .btn-*, .input, .badge-*, hábitos, heatmap, layout
@layer utilities { ... }      → .text-balance, .scrollbar-hide
```

### Fuente

Inter se carga con `next/font/google` en `layout.tsx`:

```tsx
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

El token `--font-sans` en `@theme` apunta a `var(--font-inter)`.

### Dark mode

Activación manual agregando `.dark` al `<html>`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

El toggle de tema con persistencia en `localStorage` está pendiente (SCRUM-21).

---

## Colores — Tokens y clases

### Brand (violeta)

| Token | Hex | Clase ejemplo |
|-------|-----|---------------|
| `brand-50` | `#EDE9FE` | `bg-brand-50` |
| `brand-100` | `#DDD6FE` | `bg-brand-100` |
| `brand-200` | `#C4B5FD` | `bg-brand-200` |
| `brand-300` | `#A78BFA` | `bg-brand-300` |
| `brand-400` | `#8B5CF6` | `bg-brand-400` |
| `brand-500` | `#7C3AED` | `bg-brand-500` ← acento principal |
| `brand-600` | `#6D28D9` | `bg-brand-600` ← hover |
| `brand-700` | `#5B21B6` | `text-brand-700` |
| `brand-800` | `#4C1D95` | `bg-brand-800` |
| `brand-900` | `#3B0764` | `dark:bg-brand-900` |

| Uso | Clase |
|-----|-------|
| Fondo principal | `bg-brand-500` |
| Fondo hover | `bg-brand-600` |
| Fondo sutil | `bg-brand-50 dark:bg-brand-900` |
| Texto | `text-brand-500` |
| Texto sobre oscuro | `text-brand-200` |
| Borde | `border-brand-500` |
| Ring focus | `ring-brand-500` |

### Semánticos

| Estado | Tokens | Fondo | Texto |
|--------|--------|-------|-------|
| Éxito | `success-light` `#D1FAE5` · `success` `#10B981` · `success-dark` `#059669` | `bg-success-light` | `text-success-dark` |
| Error | `danger-light` `#FFE4E6` · `danger` `#F43F5E` · `danger-dark` `#E11D48` | `bg-danger-light` | `text-danger-dark` |
| Advertencia | `warning-light` `#FEF3C7` · `warning` `#F59E0B` · `warning-dark` `#D97706` | `bg-warning-light` | `text-warning-dark` |

También disponibles como color sólido: `bg-success`, `bg-danger`, `bg-warning`, `text-success`, etc.

### Superficies (light)

| Token | Hex | Clase |
|-------|-----|-------|
| `light-bg-primary` | `#FFFFFF` | `bg-light-bg-primary` |
| `light-bg-secondary` | `#F4F4F5` | `bg-light-bg-secondary` |
| `light-bg-tertiary` | `#E4E4E7` | `bg-light-bg-tertiary` |
| `light-text-primary` | `#09090B` | `text-light-text-primary` |
| `light-text-secondary` | `#52525B` | `text-light-text-secondary` |
| `light-text-tertiary` | `#A1A1AA` | `text-light-text-tertiary` |
| `light-border` | `rgb(0 0 0 / 0.08)` | `border-light-border` |

### Superficies (dark)

| Token | Hex | Clase |
|-------|-----|-------|
| `dark-bg-primary` | `#0F0F11` | `dark:bg-dark-bg-primary` |
| `dark-bg-secondary` | `#1A1A1F` | `dark:bg-dark-bg-secondary` |
| `dark-bg-tertiary` | `#25252C` | `dark:bg-dark-bg-tertiary` |
| `dark-text-primary` | `#FAFAFA` | `dark:text-dark-text-primary` |
| `dark-text-secondary` | `#A1A1AA` | `dark:text-dark-text-secondary` |
| `dark-text-tertiary` | `#71717A` | `dark:text-dark-text-tertiary` |
| `dark-border` | `rgb(255 255 255 / 0.08)` | `dark:border-dark-border` |

### Patrón light/dark en componentes

```tsx
<p className="text-light-text-primary dark:text-dark-text-primary">Texto</p>
<div className="bg-light-bg-secondary dark:bg-dark-bg-secondary">Superficie</div>
```

---

## Tipografía

Escala definida en `@theme`. Los elementos `h1`–`h4` reciben estilos automáticos en `@layer base`.

| Clase | Tamaño | Line-height | Peso | Uso |
|-------|--------|-------------|------|-----|
| `text-heading-xl` | 28px | 1.2 | 600 | Títulos de página (`h1`) |
| `text-heading-lg` | 22px | 1.3 | 600 | Títulos de sección (`h2`) |
| `text-heading-md` | 20px | 1.4 | 600 | Subtítulos (`h3`) |
| `text-heading-sm` | 16px | 1.4 | 600 | Labels de cards (`h4`) |
| `text-body-lg` | 16px | 1.6 | 400 | Cuerpo principal |
| `text-body-md` | 15px | 1.6 | 400 | Cuerpo estándar |
| `text-body-sm` | 14px | 1.5 | 400 | Texto secundario, botones |
| `text-caption` | 13px | 1.4 | 400 | Captions y metadata |
| `text-label` | 12px | 1.3 | 500 | Labels de formularios |

---

## Spacing, radius y sombras

### Spacing extra

| Clase | Valor |
|-------|-------|
| `p-4_5` / `gap-4_5` / `m-4_5` | 18px |
| `p-13` / `gap-13` | 52px |
| `p-15` / `gap-15` | 60px |
| `p-18` / `gap-18` | 72px |

### Border radius

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` | 6px | Badges, celdas heatmap |
| `rounded-md` | 8px | Botones, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Modales |
| `rounded-full` | 9999px | Avatares, checks, badges |

### Sombras

| Clase | Uso |
|-------|-----|
| `shadow-card` | Cards en reposo |
| `shadow-card-hover` | Cards interactivas al hover |
| `shadow-brand` | Ring de focus brand |

---

## Animaciones

Definidas en `@theme` con `@keyframes` embebidos.

| Clase | Duración | Uso |
|-------|----------|-----|
| `animate-fade-in` | 0.2s ease-out | Entrada de elementos |
| `animate-streak-pulse` | 2s infinite | Indicador de racha activa |

---

## Componentes — Clases personalizadas

Todas definidas en `@layer components` de `globals.css`.
Usar directamente en JSX con `className`.

### Cards

| Clase | Descripción |
|-------|-------------|
| `.card` | Contenedor con fondo, borde y padding |
| `.card-hover` | Card interactiva con hover |

### Botones

No existe clase base `.btn`. Usar la variante directamente:

| Clase | Descripción |
|-------|-------------|
| `.btn-primary` | CTA principal (violeta) |
| `.btn-secondary` | Acción secundaria con borde |
| `.btn-ghost` | Acción terciaria / cancelar |
| `.btn-danger` | Acción destructiva |

Estados incluidos: `disabled:`, `hover:`, `active:scale-95`, `focus:ring-2`.

### Formularios

| Clase | Descripción |
|-------|-------------|
| `.input` | Campo de texto base |
| `.input-error` | Campo con borde y ring de error |
| `.label` | Etiqueta de campo |
| `.field-error` | Mensaje de error bajo el campo |

### Badges

| Clase | Descripción |
|-------|-------------|
| `.badge-success` | Hábito completado |
| `.badge-danger` | Hábito fallido |
| `.badge-warning` | Racha activa |
| `.badge-brand` | Info de marca |
| `.badge-neutral` | Estado neutro |

### Hábitos

| Clase | Descripción |
|-------|-------------|
| `.habit-card` | Card de hábito en dashboard (incluye hover) |
| `.check-circle-empty` | Hábito pendiente |
| `.check-circle-done` | Completado (violeta) |
| `.check-circle-success` | Completado (verde) |

### Heatmap

| Clase | Descripción |
|-------|-------------|
| `.heatmap-grid` | Grid 7 columnas |
| `.heatmap-cell-done` | Día completado |
| `.heatmap-cell-failed` | Día fallido |
| `.heatmap-cell-empty` | Día no programado |

### Progreso y layout

| Clase | Descripción |
|-------|-------------|
| `.progress-bar` | Contenedor de barra |
| `.progress-fill` | Relleno (usar `w-*` para porcentaje) |
| `.streak-display` | Indicador de racha animado |
| `.page-container` | Contenedor max-w-2xl centrado |
| `.page-header` | Header de página con acciones |
| `.divider` | Separador horizontal |
| `.empty-state` | Estado vacío sin datos |

### Utilidades custom

| Clase | Descripción |
|-------|-------------|
| `.text-balance` | `text-wrap: balance` |
| `.scrollbar-hide` | Oculta scrollbar |

---

## Ejemplos de uso

### Card con hábito

```tsx
<div className="habit-card">
  <div className="flex items-center gap-3">
    <div className="check-circle-done">✓</div>
    <div>
      <p className="text-body-md text-light-text-primary dark:text-dark-text-primary">
        Correr 5km
      </p>
      <p className="text-caption text-light-text-secondary dark:text-dark-text-secondary">
        5.2 km registrados
      </p>
    </div>
  </div>
  <span className="badge-warning">🔥 12 días</span>
</div>
```

### Formulario de login

```tsx
<div className="space-y-4">
  <div>
    <label className="label" htmlFor="email">Email</label>
    <input id="email" className="input" type="email" placeholder="tu@email.com" />
  </div>
  <div>
    <label className="label" htmlFor="password">Contraseña</label>
    <input id="password" className="input" type="password" />
    <p className="field-error">La contraseña es incorrecta</p>
  </div>
  <button type="button" className="btn-primary w-full">Iniciar sesión</button>
</div>
```

### Barra de progreso

```tsx
<div className="progress-bar">
  <div className="progress-fill w-4/5" />
</div>
```

### Página con layout

```tsx
<div className="page-container">
  <header className="page-header">
    <h1>Mis hábitos</h1>
    <button type="button" className="btn-primary">Nuevo</button>
  </header>
  <div className="card">...</div>
</div>
```

---

## Convenciones de implementación (Tailwind v4)

### Agregar un token nuevo

1. Definir variable en `@theme` de `globals.css`.
2. Documentar la clase resultante en este archivo.
3. Verificar con `pnpm build`.

### Agregar una clase de componente

1. Crear en `@layer components` de `globals.css`.
2. Usar solo `@apply` con **utilidades de Tailwind**, no con otras clases custom.
3. Documentar en la tabla de componentes de este archivo.

> **Importante:** Tailwind v4 no permite `@apply card` dentro de `.card-hover`.
> Cada variante debe incluir sus propias utilidades (ver `.btn-primary`, `.habit-card`).

### Agregar una animación

1. Definir `@keyframes` dentro de `@theme`.
2. Registrar con `--animate-nombre: keyframes duración easing`.
3. Usar como `animate-nombre`.

---

## Reglas estrictas para agentes

### Siempre hacer

- Usar `.card` o `.card-hover` para contenedores con fondo
- Usar `.btn-primary` para acciones principales
- Usar `.input` y `.label` en formularios
- Usar `.badge-*` para estados y etiquetas
- Agregar `dark:` en todos los colores de superficie y texto
- Usar `text-heading-*` / `text-body-*` para tipografía
- Agregar tokens nuevos en `@theme` de `globals.css`

### Nunca hacer

- Hardcodear colores: `style={{ color: '#7C3AED' }}`
- Usar colores Tailwind default (`bg-zinc-*`, `text-gray-*`) para UI de la app
- Omitir variante `dark:` en elementos de color
- Crear `tailwind.config.ts`
- Usar `@apply` entre clases custom del mismo `@layer components`
- Usar `font-bold` / `font-semibold` fuera de la escala tipográfica

---

## Checklist pre-entrega

```
□ ¿Usé clases del design system (no colores hardcodeados)?
□ ¿Todos los colores tienen variante dark:?
□ ¿Los botones usan .btn-primary / .btn-secondary / .btn-ghost?
□ ¿Los inputs usan .input y los labels .label?
□ ¿Las cards usan .card o .card-hover?
□ ¿La tipografía sigue text-heading-* / text-body-*?
□ ¿pnpm typecheck && pnpm lint && pnpm build pasan?
```

---

## Referencias

- Implementación: `src/app/globals.css`
- Layout y fuente: `src/app/layout.tsx`
- Convenciones técnicas: `docs/specs/SPEC_CONVENTIONS.md`
- Toggle dark mode (pendiente): backlog SCRUM-21
