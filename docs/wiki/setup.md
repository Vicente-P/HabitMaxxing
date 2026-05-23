# 💻 Etapa 4 — Desarrollo: Sprint 1

## 🎯 Objetivo del Sprint 1

Tener la **autenticación básica funcionando** cubriendo las siguientes historias de usuario:

| Historia | Ticket | Descripción |
|---|---|---|
| HU-01 | SCRUM-6 | Registro de cuenta |
| HU-02 | SCRUM-7 | Inicio de sesión |
| HU-03 | SCRUM-8 | Cierre de sesión |

---

## 🛠️ Decisiones técnicas

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | Next.js 15 | App Router moderno, API Routes integradas |
| Lenguaje | TypeScript | Tipado estático, estándar en la industria |
| Estilos | Tailwind CSS | Utilidades CSS, rápido de implementar |
| ORM | Prisma 7 | Type-safe, migraciones automáticas |
| Base de datos | PostgreSQL (Supabase) | Plan gratuito, cercano a Chile (São Paulo) |
| Autenticación | Auth.js v5 | Versión moderna diseñada para App Router |
| Hash de contraseñas | bcryptjs | Estándar para hashear passwords |
| Validación | Zod 4 | Validación de schemas con TypeScript |
| Package manager | pnpm | Más rápido y eficiente que npm |

---

## 📦 Inicialización del proyecto

### Crear el proyecto Next.js

```bash
pnpm create next-app@latest habit-maxxing \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

> ⚠️ El nombre del proyecto no puede tener mayúsculas por restricciones de npm.

### ¿Qué hace cada flag?

| Flag | Descripción |
|---|---|
| `.` | Crea el proyecto en la carpeta actual |
| `--typescript` | Agrega TypeScript en vez de JavaScript puro |
| `--tailwind` | Instala y configura Tailwind CSS |
| `--eslint` | Instala ESLint para detectar errores en tiempo real |
| `--app` | Usa el App Router moderno de Next.js |
| `--src-dir` | Pone el código fuente dentro de `src/` |
| `--import-alias "@/*"` | Crea el atajo `@/` para importaciones limpias |

### Aprobar builds de pnpm

pnpm bloquea scripts de instalación por seguridad. Al instalar dependencias ejecutar:

```bash
pnpm approve-builds
# Seleccionar con espacio: sharp y unrs-resolver → Enter
```

---

## 📦 Instalación de dependencias

```bash
# ORM y base de datos
pnpm add prisma @prisma/client

# Autenticación (Auth.js v5)
pnpm add next-auth@5.0.0-beta.29

# Hash de contraseñas
pnpm add bcryptjs

# Validación
pnpm add zod

# dotenv (necesario para Prisma 7)
pnpm add -D dotenv

# Inicializar Prisma
pnpm dlx prisma init
```

> 💡 En Prisma 7 se usa `pnpm dlx` en vez de `npx` para ejecutar comandos sin instalar globalmente.

### ⚠️ Notas sobre dependencias

- `@types/bcryptjs` → **NO instalar**. `bcryptjs` ya incluye sus propios tipos TypeScript.
- `next-auth@4.x` → Versión antigua. Usar siempre `next-auth@5.x` (Auth.js) para el App Router.
- `uuid@8.3.2` → Warning de deprecación interno de next-auth. Se puede ignorar.

---

## 🗂️ Estructura de carpetas

```
habit-maxxing/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts       ← Endpoints de Auth.js
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx           ← Página de login
│   │   │   └── register/
│   │   │       └── page.tsx           ← Página de registro
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx           ← Dashboard principal
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                        ← Botones, inputs, cards
│   │   └── auth/                      ← Formularios de auth
│   ├── lib/
│   │   ├── prisma.ts                  ← Cliente de Prisma
│   │   ├── auth.ts                    ← Configuración Auth.js
│   │   └── validations.ts             ← Schemas de Zod
│   ├── hooks/                         ← Custom hooks
│   └── types/
│       └── index.ts                   ← Tipos globales
├── prisma/
│   └── schema.prisma                  ← Modelos de base de datos
├── prisma.config.ts                   ← Configuración de Prisma 7
├── .env                               ← Variables de entorno (NO subir a GitHub)
├── .env.example                       ← Plantilla de variables (SÍ subir a GitHub)
└── public/
```

### ¿Por qué esos nombres especiales?

```
(auth)/        → Grupo de rutas en Next.js App Router.
               Los paréntesis NO aparecen en la URL.
               /login en vez de /auth/login

(dashboard)/   → Mismo concepto para páginas protegidas.

[...nextauth]/ → Ruta dinámica que captura cualquier segmento.
               Maneja /api/auth/signin, /api/auth/signout,
               /api/auth/callback con un solo archivo.
```

### Comandos para crear la estructura

```bash
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(dashboard\)/dashboard
mkdir -p src/components/ui
mkdir -p src/components/auth
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/hooks

touch src/app/\(auth\)/login/page.tsx
touch src/app/\(auth\)/register/page.tsx
touch src/app/\(dashboard\)/dashboard/page.tsx
touch src/app/api/auth/\[...nextauth\]/route.ts
touch src/lib/prisma.ts
touch src/lib/auth.ts
touch src/lib/validations.ts
touch src/types/index.ts
touch .env.example
```

---

## 🗄️ Base de datos — Supabase

### Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New Project"**
3. Completa:
   - **Name:** habit-maxxing
   - **Password:** genera una contraseña segura y guárdala
   - **Region:** South America (São Paulo) ← más cercano a Chile
4. Espera ~2 minutos mientras se crea el proyecto

### Obtener la URL de conexión

En Supabase → **Settings → Database → Connection string**

> ⚠️ Usar siempre el **Transaction Pooler** (puerto 6543), no la conexión directa (puerto 5432) ya que puede estar bloqueada.

```
# ❌ Direct connection — puede estar bloqueado
postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres

# ✅ Transaction pooler — recomendado para Prisma
postgresql://postgres.[ref]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### Verificar restricciones de red

En Supabase → **Settings → Network** verificar que no haya restricciones de IP activas.

---

## 🔑 Variables de entorno

### `.env` (NO subir a GitHub)

```bash
# Base de datos (Transaction Pooler de Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Auth.js
NEXTAUTH_SECRET="super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

> 💡 Para generar un `NEXTAUTH_SECRET` seguro:
> ```bash
> openssl rand -base64 32
> ```

### `.env.example` (SÍ subir a GitHub)

```bash
# Base de datos
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Auth.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📐 Schema de Prisma

### `prisma/schema.prisma`

> ⚠️ En Prisma 7 la URL de conexión ya NO va en `schema.prisma`. Se mueve a `prisma.config.ts`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  habits    Habit[]
}

model Habit {
  id        String     @id @default(cuid())
  name      String
  type      HabitType
  unit      String?
  frequency Int[]
  userId    String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs      HabitLog[]
}

model HabitLog {
  id        String   @id @default(cuid())
  habitId   String
  date      DateTime @db.Date
  completed Boolean  @default(false)
  value     Float?
  createdAt DateTime @default(now())
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
}

enum HabitType {
  BINARY
  NUMERIC
}
```

### `prisma.config.ts` (raíz del proyecto)

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

---

## 🚀 Migración de base de datos

```bash
# Crea las tablas en Supabase
pnpm dlx prisma migrate dev --name init

# Genera el cliente de Prisma
pnpm dlx prisma generate
```

Resultado esperado:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

Verificar en Supabase → **Table Editor** que existan las tablas:
```
✅ User
✅ Habit
✅ HabitLog
```

---

## 📝 Comandos útiles de Prisma

| Comando | Descripción |
|---|---|
| `pnpm dlx prisma migrate dev --name <nombre>` | Crea una nueva migración |
| `pnpm dlx prisma generate` | Genera el cliente de Prisma |
| `pnpm dlx prisma studio` | Abre GUI para ver y editar datos |
| `pnpm dlx prisma db push` | Sincroniza schema sin crear migración |
| `pnpm dlx prisma migrate reset` | Resetea la base de datos |

---

## 🌿 Rama de trabajo

```bash
# Verificar rama activa
git branch
# → feature/SCRUM-6-registro-cuenta

# Commit inicial del setup
git add .
git commit -m "chore(setup): initialize Next.js project with Auth.js and Prisma

- Add Next.js 15 with TypeScript and Tailwind CSS
- Configure Prisma 7 with PostgreSQL schema (User, Habit, HabitLog)
- Install Auth.js v5 for authentication
- Install Zod 4 for validation
- Install bcryptjs for password hashing
- Set up project folder structure
- Add .env.example template"

git push origin feature/SCRUM-6-registro-cuenta
```

---

## ✅ Checklist de verificación

```
□ Proyecto Next.js inicializado correctamente
□ pnpm dev corre sin errores en localhost:3000
□ Estructura de carpetas creada
□ Dependencias instaladas sin errores
□ Proyecto creado en Supabase
□ DATABASE_URL configurada con Transaction Pooler
□ prisma.config.ts creado en la raíz
□ Schema de Prisma definido sin url en datasource
□ Migración ejecutada exitosamente
□ Tablas visibles en Supabase Table Editor
□ .env NO subido a GitHub
□ .env.example subido al repositorio
□ Commit inicial subido a GitHub
```

---

## 🔗 Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma 7 Config](https://pris.ly/d/config-datasource)
- [Auth.js v5 Docs](https://authjs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Zod Docs](https://zod.dev)
- [Jira — Habit Tracker](https://vperezc18.atlassian.net/browse/SCRUM)