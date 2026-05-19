# Guía de instalación y configuración

## Tabla de contenidos

- [Prerequisitos](#prerequisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Iniciar el servidor de desarrollo](#iniciar-el-servidor-de-desarrollo)
- [Checklist](#checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisitos

Verificá que tenés instalado lo siguiente antes de comenzar:

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20.x | `node -v` |
| pnpm | 9.x | `pnpm -v` |
| Git | — | `git -v` |

Si no tenés pnpm instalado:

```bash
npm install -g pnpm
```

---

## Instalación

**1. Clona el repositorio**

```bash
git clone https://github.com/Vicente-P/habitmaxxing.git
cd habitmaxxing
```

**2. Instala las dependencias**

```bash
pnpm install
```

---

## Variables de entorno

**3. Copia el archivo de ejemplo**

```bash
cp .env.example .env
```

**4. Completa las variables en `.env`**

```env
# Supabase Session Pooler — para queries de la app y migraciones
DATABASE_URL="postgresql://postgres.[project-ref]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Auth.js — genera un string aleatorio seguro
AUTH_SECRET="tu-secret-aqui"
```

### Obtener la URL de Supabase

1. Abrí tu proyecto en [supabase.com](https://supabase.com)
2. Andá a **Settings → Database → Connection String**
3. Seleccioná la pestaña **Session Pooler**
4. Copiá la URL y reemplazá `[YOUR-PASSWORD]` con tu contraseña

> ⚠️ **Importante:** Usá el **Session Pooler** (puerto 5432, no 6543). El Transaction Pooler no soporta migraciones DDL.

### Generar AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Base de datos

**5. Ejecuta las migraciones**

```bash
pnpm dlx prisma migrate dev --name init
```

Deberías ver:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

**6. Genera el cliente de Prisma**

```bash
pnpm dlx prisma generate
```

> En Prisma 7, `migrate dev` no genera el cliente automáticamente — hay que correr este comando por separado.

---

## Iniciar el servidor de desarrollo

**7. Levantá el servidor**

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Checklist

- [ ] Node.js 20+ instalado
- [ ] pnpm instalado
- [ ] Repositorio clonado
- [ ] `pnpm install` ejecutado sin errores
- [ ] `.env` creado con `DATABASE_URL` y `AUTH_SECRET`
- [ ] `prisma migrate dev` ejecutado sin errores
- [ ] `prisma generate` ejecutado
- [ ] `pnpm dev` levanta en `localhost:3000`

---

## Troubleshooting

### `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`

El archivo `.env` no existe o la variable `DATABASE_URL` no está definida.

```bash
# Verificá que el archivo existe
ls -la .env

# Verificá que DATABASE_URL está presente
grep DATABASE_URL .env
```

---

### La migración se cuelga sin error

Estás usando el **Transaction Pooler** (puerto 6543) en vez del Session Pooler. Actualizá tu `DATABASE_URL` para que use el puerto **5432** con el host del Session Pooler.

```
# ❌ Transaction Pooler — no soporta migraciones
DATABASE_URL="postgresql://...@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# ✅ Session Pooler — compatible con migraciones
DATABASE_URL="postgresql://...@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

---

### `Error: connect ECONNREFUSED` o timeout de conexión

Si usás la URL de **conexión directa** (`db.XXXX.supabase.co`) en una red doméstica, va a fallar porque Supabase usa IPv6-only para esas conexiones. Usá el Session Pooler en su lugar.

---

### Tipos de Prisma desactualizados después de cambiar el schema

Después de modificar `prisma/schema.prisma`, siempre corré:

```bash
pnpm dlx prisma migrate dev --name descripcion-del-cambio
pnpm dlx prisma generate
```
