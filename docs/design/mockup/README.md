# Mockup de diseño — Habit Maxxing

Fuente de verdad visual de la plataforma. Reemplaza por completo el design system anterior.

| Campo | Valor |
|-------|-------|
| Origen | Artifact "Habit Maxxing — Prototipo", hecho con Claude Design |
| Enlace | https://claude.ai/artifact/TRXGZovYXH5eeMhkJ8D9rS |
| Versión exportada | `1792190389-e73e` (2026-10-16) |
| Tema por defecto | Oscuro (`:root`) |

Los archivos de esta carpeta son una copia de lectura. No se importan en la app: el código de producción vive en `src/` y se implementa a partir de estas referencias.

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `tokens.css` | Tokens `--hm-*` exactos del mockup (dark, light y escala tipográfica) |
| `atoms.jsx` | Átomos: `Icon`, `HabitCheck`, `StreakBadge`, `Heatmap`, `YearHeatmap`, `WeekDots`, `ProgressBar`, `ProgressRing`, `Sparkline`, `HabitIcon` |
| `ios-frame.jsx` | Marco de dispositivo iOS, barra de estado, lista, teclado |
| `desktop-dashboards.jsx` | Dashboards desktop: Dense, Quiet, Vibrant |
| `desktop-habit-screens.jsx` | Detalle de hábito y creación de hábito, desktop |
| `mobile-screens.jsx` | Dashboard móvil, detalle, creación, estadísticas, barra de pestañas |
| `app.jsx` | Composición de la app (usa `DashboardVibrant`) |

Se omitió el runtime de diseño del artifact (canvas, React, Babel, fuentes) porque no forma parte del producto.

## Traducción al repo

El mockup usa estilos inline que leen variables CSS. En el repo se traducen así:

1. **Tokens:** los valores de `tokens.css` se copian sin cambios a `src/app/globals.css`. Única adición: `--hm-on-accent: #FFFFFF`, porque el mockup escribe `#fff` literal en botones y checks sin token equivalente.
2. **Estilos inline → clases:** cada propiedad inline se convierte en utilidad Tailwind que referencia un token (`bg-hm-accent`, `text-hm-text-mid`, `rounded-hm-sm`). Así no hay estilos inline de color ni tipografía.
3. **Estilos sin definición en el mockup:** los inputs y el select no tienen especificación explícita. Se derivan de sus patrones (superficie `--hm-surface`, borde `--hm-border`, radio `--hm-r-sm`, foco con `--hm-accent`). Cualquier diferencia visual se consulta.
4. **Tema:** el oscuro es el predeterminado. El toggle de tema queda para SCRUM-21.

## Pantallas implementadas hoy

Login, registro, dashboard con catálogo y formulario de creación, cierre de sesión y landing de plantilla. El detalle de hábito, estadísticas y onboarding del mockup aún no existen en la app; se implementan con sus historias.
