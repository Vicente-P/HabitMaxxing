# Arquitectura — Flujo de Autenticación

> ⚠️ **Documento en construcción.** La implementación de `src/lib/auth.ts` está pendiente.
> Este documento se completará cuando EP-01 esté implementado.

---

## Stack de autenticación

| Librería | Versión | Rol |
|---------|---------|-----|
| Auth.js (NextAuth) | 5.0.0-beta.29 | Sesiones y providers |
| bcryptjs | 3.0.3 | Hash de contraseñas |
| Zod | 4.4.3 | Validación de inputs |
| Prisma | 7.8.0 | Persistencia de usuarios |

---

## Flujo planeado

### Registro

```mermaid
sequenceDiagram
    participant Cliente
    participant API as /api/auth/register
    participant Zod
    participant Prisma
    participant DB as PostgreSQL

    Cliente->>API: POST { email, password, name }
    API->>Zod: Valida schema
    alt Inválido
        Zod-->>Cliente: 400 Validation error
    else Válido
        API->>Prisma: findUnique({ email })
        Prisma->>DB: SELECT user WHERE email
        DB-->>Prisma: null / User
        alt Email ya existe
            API-->>Cliente: 409 Email already exists
        else Email libre
            API->>API: bcryptjs.hash(password)
            API->>Prisma: create({ email, password hash, name })
            Prisma->>DB: INSERT User
            DB-->>Prisma: User creado
            API-->>Cliente: 201 Created
        end
    end
```

### Login

```mermaid
sequenceDiagram
    participant Cliente
    participant AuthJS as Auth.js (Credentials Provider)
    participant Prisma
    participant DB as PostgreSQL

    Cliente->>AuthJS: signIn({ email, password })
    AuthJS->>Prisma: findUnique({ email })
    Prisma->>DB: SELECT user WHERE email
    DB-->>Prisma: User / null
    alt Usuario no existe
        AuthJS-->>Cliente: Error: Invalid credentials
    else Usuario existe
        AuthJS->>AuthJS: bcryptjs.compare(password, hash)
        alt Contraseña incorrecta
            AuthJS-->>Cliente: Error: Invalid credentials
        else Contraseña correcta
            AuthJS->>AuthJS: Crea sesión JWT
            AuthJS-->>Cliente: Redirect + Session cookie
        end
    end
```

---

## Protección de rutas

La protección se implementa mediante middleware de Next.js que verifica la sesión de Auth.js antes de permitir el acceso a las rutas del grupo `(dashboard)`.

```
Rutas públicas:  /login, /register
Rutas protegidas: /dashboard, /habits, /stats (pendientes)
```

---

## Archivos relevantes

| Archivo | Descripción |
|---------|-------------|
| `src/lib/auth.ts` | Configuración de Auth.js — providers, callbacks, session |
| `src/lib/validations.ts` | Schemas Zod para registro y login |
| `src/app/api/auth/[...nextauth]/route.ts` | Handler HTTP de Auth.js |
| `src/app/(auth)/login/page.tsx` | Página de login |
| `src/app/(auth)/register/page.tsx` | Página de registro |
