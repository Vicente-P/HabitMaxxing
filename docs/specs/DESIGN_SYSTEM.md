# Design System — HabitMaxxing

## Regla principal para agentes

SIEMPRE usa las clases y variables definidas en este documento.
NUNCA uses colores hexadecimales hardcodeados directamente en
los componentes. NUNCA uses estilos inline para colores o
tipografía. Usa SIEMPRE las clases de Tailwind definidas.

---

## Stack de estilos

- Tailwind CSS 4 con tokens en `@theme` dentro de `src/app/globals.css`
- Clases de componente en `@layer components` de `globals.css`
- PostCSS: `@tailwindcss/postcss` (sin `tailwind.config.ts`)
- Fuente: Inter vía `next/font/google` en `src/app/layout.tsx`
- Modo oscuro: `@custom-variant dark` + clase `.dark` en `<html>`

### Dark mode

El dark mode se activa agregando la clase `.dark` al elemento `<html>`.
La variante CSS está definida así:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

El toggle de tema (SCRUM-21) persistirá la preferencia en `localStorage`.

---

## Colores — Clases Tailwind

### Color de acento (brand)

| Uso | Clase |
|---|---|
| Fondo principal | `bg-brand-500` |
| Fondo hover | `bg-brand-600` |
| Fondo sutil | `bg-brand-50 dark:bg-brand-900` |
| Texto | `text-brand-500` |
| Texto sobre fondo oscuro | `text-brand-200` |
| Borde | `border-brand-500` |
| Ring focus | `ring-brand-500` |

### Colores semánticos

| Estado | Fondo | Texto |
|---|---|---|
| Éxito (completado) | `bg-success-light` | `text-success-dark` |
| Error (fallido) | `bg-danger-light` | `text-danger-dark` |
| Advertencia (racha) | `bg-warning-light` | `text-warning-dark` |

### Fondos

| Uso | Light | Dark |
|---|---|---|
| Página | `bg-light-bg-primary` | `dark:bg-dark-bg-primary` |
| Superficie | `bg-light-bg-secondary` | `dark:bg-dark-bg-secondary` |
| Superficie elevada | `bg-light-bg-tertiary` | `dark:bg-dark-bg-tertiary` |

### Textos

| Uso | Light | Dark |
|---|---|---|
| Principal | `text-light-text-primary` | `dark:text-dark-text-primary` |
| Secundario | `text-light-text-secondary` | `dark:text-dark-text-secondary` |
| Terciario | `text-light-text-tertiary` | `dark:text-dark-text-tertiary` |

### Bordes

| Uso | Light | Dark |
|---|---|---|
| Estándar | `border-light-border` | `dark:border-dark-border` |

---

## Tipografía — Clases Tailwind

| Clase | Tamaño | Peso | Uso |
|---|---|---|---|
| `text-heading-xl` | 28px | 600 | Títulos de página |
| `text-heading-lg` | 22px | 600 | Títulos de sección |
| `text-heading-md` | 20px | 600 | Subtítulos |
| `text-heading-sm` | 16px | 600 | Labels de cards |
| `text-body-lg` | 16px | 400 | Cuerpo principal |
| `text-body-md` | 15px | 400 | Cuerpo estándar |
| `text-body-sm` | 14px | 400 | Texto secundario |
| `text-caption` | 13px | 400 | Captions y metadata |
| `text-label` | 12px | 500 | Labels de formularios |

---

## Componentes — Clases personalizadas

Definidas en `@layer components` de `src/app/globals.css`.

| Componente | Clase | Variantes |
|---|---|---|
| Card base | `.card` | `.card-hover` |
| Botón primario | `.btn-primary` | — |
| Botón secundario | `.btn-secondary` | — |
| Botón ghost | `.btn-ghost` | — |
| Botón peligro | `.btn-danger` | — |
| Input base | `.input` | `.input-error` |
| Label | `.label` | — |
| Error de campo | `.field-error` | — |
| Badge éxito | `.badge-success` | — |
| Badge error | `.badge-danger` | — |
| Badge advertencia | `.badge-warning` | — |
| Badge brand | `.badge-brand` | — |
| Badge neutro | `.badge-neutral` | — |
| Habit card | `.habit-card` | — |
| Check vacío | `.check-circle-empty` | — |
| Check completado | `.check-circle-done` | — |
| Check éxito | `.check-circle-success` | — |
| Grid heatmap | `.heatmap-grid` | — |
| Celda heatmap | `.heatmap-cell-done` | `.heatmap-cell-failed`, `.heatmap-cell-empty` |
| Barra progreso | `.progress-bar` + `.progress-fill` | — |
| Racha | `.streak-display` | — |
| Contenedor página | `.page-container` | — |
| Header página | `.page-header` | — |
| Separador | `.divider` | — |
| Estado vacío | `.empty-state` | — |

---

## Border radius

| Clase | Valor | Uso |
|---|---|---|
| `rounded-sm` | 6px | Badges, pills pequeños |
| `rounded-md` | 8px | Botones, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Modales |
| `rounded-full` | 9999px | Avatares, círculos |

---

## Sombras

| Clase | Uso |
|---|---|
| `shadow-card` | Cards en reposo |
| `shadow-card-hover` | Cards interactivas al hover |
| `shadow-brand` | Ring de focus brand |

---

## Animaciones

Definidas en `@theme` de `globals.css` con `@keyframes` embebidos.

| Clase | Uso |
|---|---|
| `animate-fade-in` | Entrada de elementos |
| `animate-streak-pulse` | Indicador de racha activa |

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
    <label className="label">Email</label>
    <input className="input" type="email" placeholder="tu@email.com" />
  </div>
  <div>
    <label className="label">Contraseña</label>
    <input className="input" type="password" />
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

---

## Reglas estrictas para agentes

### Siempre hacer

- Usar `.card` para cualquier contenedor con fondo
- Usar `.btn-primary` para acciones principales
- Usar `.input` para todos los campos de formulario
- Usar `.label` para todos los labels de formulario
- Usar `.badge-*` para estados y etiquetas
- Agregar variante `dark:` en TODOS los colores
- Usar `text-heading-*` para jerarquía tipográfica
- Agregar nuevos tokens en `@theme` de `globals.css`

### Nunca hacer

- Hardcodear colores: `style={{ color: '#7C3AED' }}`
- Usar clases de Tailwind no extendidas para colores de marca
- Omitir la variante `dark:` en elementos de color
- Crear nuevos componentes sin seguir el patrón existente
- Usar `font-bold` o `font-semibold` sin seguir la escala tipográfica
- Crear `tailwind.config.ts` (el proyecto usa Tailwind v4 CSS-first)
- Crear nuevas animaciones sin agregarlas al bloque `@theme` de `globals.css`
