# 🌿 Etapa 3 — Git & Gitflow

## ¿Qué es Gitflow?

Gitflow es una **estrategia de ramas** que define exactamente cómo fluye el código desde que lo escribes hasta que llega a producción. Fue diseñada para equipos que trabajan con releases planificados.

```
El código viaja así:

  feature → develop → release → main
                ↑
            hotfix ──────────────→ main
```

---

## 🌿 Las 5 ramas de Gitflow

| Rama | Propósito | ¿Se elimina? |
|---|---|---|
| `main` | Código en **producción**. Siempre estable. | ❌ Nunca |
| `develop` | Integración de features. Base de desarrollo. | ❌ Nunca |
| `feature/*` | Una feature por historia de usuario. | ✅ Al hacer merge |
| `release/*` | Preparación de una versión para producción. | ✅ Al hacer merge |
| `hotfix/*` | Corrección urgente directo sobre producción. | ✅ Al hacer merge |

---

## 📐 Reglas de oro de Gitflow

- ✅ Nunca commitear directamente en `main` o `develop`
- ✅ Cada historia de usuario = una rama `feature`
- ✅ Los nombres de ramas siguen una convención estricta
- ✅ Todo merge se hace via Pull Request (nunca directo)
- ✅ `main` siempre tiene un tag de versión

---

## 🏷️ Convención de nombres de ramas

```bash
feature/SCRUM-6-registro-cuenta
feature/SCRUM-7-inicio-sesion
feature/SCRUM-8-cierre-sesion
release/1.0.0
hotfix/SCRUM-99-fix-login-crash
```

> 💡 El prefijo `SCRUM-X` conecta la rama directamente con el ticket de Jira. Esto permite trazabilidad total entre código y requisitos.

---

## 🗺️ Flujo completo de una historia de usuario

```
1. Tomas HU-01 en Jira → la mueves a "En progreso"
2. Creas rama: git checkout -b feature/SCRUM-6-registro-cuenta
3. Desarrollas y haces commits atómicos
4. Subes la rama: git push origin feature/SCRUM-6-registro-cuenta
5. Abres un Pull Request hacia develop
6. Se revisa el código (code review)
7. Se aprueba y hace merge a develop
8. Se elimina la rama feature
9. En Jira mueves el ticket a "Done"
```

---

## ✍️ Commits convencionales (Conventional Commits)

### Estructura

```bash
<tipo>(<scope>): <descripción corta>
```

### Tipos más comunes

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `test` | Agregando tests |
| `refactor` | Cambio de código sin nueva funcionalidad |
| `docs` | Documentación |
| `chore` | Configuración, dependencias |

### Ejemplos reales

```bash
feat(auth): add POST /api/auth/register endpoint
fix(auth): handle duplicate email validation error
test(auth): add unit tests for register service
chore: initialize Next.js project structure
```

---

## 🚀 Setup inicial del repositorio

### Paso 1 — Crear el repositorio en GitHub

Ve a [github.com/new](https://github.com/new) y crea un repositorio llamado `habit-tracker` como **público**.

### Paso 2 — Inicializar el proyecto localmente

```bash
# Crea la carpeta del proyecto
mkdir habit-tracker && cd habit-tracker

# Inicializa git
git init

# Crea el archivo inicial
echo "# Habit Tracker" > README.md

# Primer commit
git add .
git commit -m "chore: initialize repository"

# Conecta con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/habit-tracker.git

# Sube main
git push -u origin main
```

### Paso 3 — Crear la rama develop

```bash
# Crea y posiciónate en develop
git checkout -b develop

# Súbela a GitHub
git push -u origin develop
```

### Paso 4 — Proteger las ramas en GitHub

Ve a tu repositorio → **Settings → Branches → Add rule** y configura lo siguiente para `main` y `develop`:

- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
- ✅ Do not allow bypassing the above settings

### Paso 5 — Crear la primera rama feature

```bash
# Asegúrate de estar en develop
git checkout develop

# Crea la rama para HU-01
git checkout -b feature/SCRUM-6-registro-cuenta
```

---

## 📊 Planificación de Sprints

| Sprint | Historias | Story Points | Objetivo |
|---|---|---|---|
| Sprint 1 | HU-01, HU-02, HU-03 | 9 SP | Auth básica funcionando |
| Sprint 2 | HU-04, HU-06, HU-09 | 8 SP | Recuperar contraseña + CRUD hábitos |
| Sprint 3 | HU-07, HU-08, HU-10, HU-11 | 8 SP | Editar/eliminar + registro diario |
| Sprint 4 | HU-12, HU-13 | 8 SP | Rachas + Heatmap |
| Sprint 5 | HU-14, HU-15, HU-16, HU-05 | 9 SP | Estadísticas + Responsive + Polish |

---

## 🗺️ Roadmap del proyecto

| | Fase 1 — MVP | Fase 2 | Fase 3 |
|---|---|---|---|
| Auth + Sync nube | ✅ | | |
| Hábitos CRUD | ✅ | | |
| Registro diario | ✅ | | |
| Rachas + Heatmap | ✅ | | |
| Recordatorios email | | ✅ | |
| Puntos y recompensas | | ✅ | |
| Funciones sociales | | | ✅ |

---

## 🔗 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Gitflow Original (Vincent Driessen)](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Docs — Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Jira — Habit Tracker Project](https://vperezc18.atlassian.net/browse/SCRUM)