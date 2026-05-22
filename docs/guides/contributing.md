# Guía de contribución

## Tabla de contenidos

- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Convención de ramas](#convención-de-ramas)
- [Conventional Commits](#conventional-commits)
- [Tickets en Jira](#tickets-en-jira)
- [Pull Requests](#pull-requests)
- [Checklist antes de abrir un PR](#checklist-antes-de-abrir-un-pr)

---

## Flujo de trabajo con Git

El proyecto usa **Gitflow** como estrategia de branching.

```
main          ←── releases estables, tags de versión
  └── develop ←── rama de integración principal
        └── feature/SCRUM-N-descripcion  ←── desarrollo de features
        └── hotfix/descripcion            ←── fixes urgentes en producción
        └── release/vX.Y.Z               ←── preparación de release
```

**Regla principal:** nunca hagas commits directamente a `main` o `develop`. Todo cambio entra mediante una rama y un Pull Request.

---

## Convención de ramas

```
feature/SCRUM-[N]-[descripcion-en-kebab-case]
hotfix/[descripcion-en-kebab-case]
release/v[X.Y.Z]
```

**Ejemplos:**

```
feature/SCRUM-1-auth-login
feature/SCRUM-5-habit-crud
feature/SCRUM-12-heatmap-calendar
hotfix/fix-session-expiry
release/v1.0.0
```

### Crear una rama de feature

```bash
# Asegurate de estar en develop actualizado
git checkout develop
git pull origin develop

# Creá la rama
git checkout -b feature/SCRUM-N-descripcion
```

---

## Conventional Commits

Todos los commits siguen el estándar [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<scope opcional>): <descripción en imperativo>
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `refactor` | Cambio de código que no agrega feature ni corrige bug |
| `test` | Agregar o modificar tests |
| `docs` | Cambios en documentación |
| `chore` | Tareas de mantenimiento (deps, config, CI) |
| `style` | Cambios de formato que no afectan la lógica |

### Ejemplos

```bash
git commit -m "feat(auth): add login form with email and password"
git commit -m "fix(habits): correct frequency array validation"
git commit -m "docs(setup): add troubleshooting section"
git commit -m "chore: update prisma to 7.8.0"
git commit -m "refactor(db): extract prisma singleton to lib/prisma.ts"
```

---

## Tickets en Jira

Cada feature o fix debe tener un ticket en Jira antes de comenzar el desarrollo.

- **Proyecto:** [SCRUM](https://vperezc18.atlassian.net/browse/SCRUM)
- **Formato del ticket:** `SCRUM-N`

Incluí el número de ticket en el nombre de la rama:

```
feature/SCRUM-3-register-page
```

---

## Pull Requests

1. **Abrí el PR** desde tu rama hacia `develop`
2. **Título del PR:** seguir el mismo formato que Conventional Commits
3. **Descripción:** explicar qué cambia y por qué
4. **Self-review:** revisá tus propios cambios antes de pedir review
5. **Merge:** usar **Squash and merge** para mantener el historial limpio

---

## Validaciones automáticas — Husky

El proyecto usa **Husky** para ejecutar validaciones locales antes de que git permita el commit o el push.

### `pre-commit`

Corre automáticamente al hacer `git commit`. Ejecuta **lint-staged**: ESLint solo sobre los archivos `.ts` y `.tsx` que están staged.

```
git commit -m "feat: ..."
→ lint-staged corre ESLint en archivos staged
→ si hay errores: commit cancelado
→ si pasa: commit realizado
```

### `pre-push`

Corre automáticamente al hacer `git push`. Ejecuta el typecheck completo del proyecto.

```
git push
→ tsc --noEmit corre sobre todo el proyecto
→ si hay errores de tipos: push cancelado
→ si pasa: push realizado
```

> Los hooks se activan solos al correr `pnpm install`. Si por alguna razón no funcionan, corré `pnpm exec husky`.

---

## Checklist antes de abrir un PR

- [ ] La rama parte de `develop` actualizado
- [ ] El nombre de la rama sigue la convención `feature/SCRUM-N-descripcion`
- [ ] Todos los commits siguen Conventional Commits
- [ ] El código corre sin errores (`pnpm dev`)
- [ ] El pre-commit hook pasa (lint sin errores)
- [ ] El pre-push hook pasa (typecheck sin errores)
- [ ] El CI en GitHub Actions está en verde
- [ ] El ticket de Jira está vinculado en la descripción del PR
