---
id: SPEC-hu-01-account-registration
companions:
  - registration-contract.md
  - ../../../../docs/specs/DESIGN_SYSTEM.md
sources:
  - ../../../../docs/wiki/backlog.md
  - ../../../../docs/specs/auth/register.md
  - ../../../../docs/specs/models/user.md
  - ../../../../docs/specs/SPEC_CONVENTIONS.md
  - ../../../../docs/architecture/auth-flow.md
  - ../../../../prisma/schema.prisma
---

> **Contrato canónico.** Este SPEC y los archivos de `companions:` forman el contrato validado para HU-01. Los artefactos de `sources:` son trazabilidad; consultar solo para narrativa omitida deliberadamente.

# Registro de cuenta HU-01

## Why

Las personas nuevas necesitan crear una cuenta para habilitar la sincronización de sus hábitos entre sesiones. Un registro seguro y comprensible permite iniciar esa relación sin exponer datos sensibles ni confundir un fallo posterior de inicio de sesión con la creación de la cuenta.

## Capabilities

- **CAP-1**
  - **intent:** Una persona nueva puede crear una cuenta con email y contraseña para habilitar la sincronización de sus datos.
  - **success:** Email válido y contraseña de al menos 8 caracteres crean una cuenta activa; el flujo permite llegar al dashboard cuando el inicio automático de sesión funciona.
- **CAP-2**
  - **intent:** La persona puede corregir datos inválidos o comprender que el registro no se completó sin conocer datos de otras cuentas.
  - **success:** Datos inválidos reciben errores de validación; los conflictos de email no revelan a la UI si la cuenta existe.
- **CAP-3**
  - **intent:** La persona puede continuar si falla el inicio automático después de crear la cuenta.
  - **success:** La cuenta permanece válida y la interfaz explica el fallo y ofrece un enlace al login.

## Constraints

- El registro es público mediante `POST /api/auth/register`; Auth.js Credentials gestiona login/sesión y `proxy.ts` protege rutas autenticadas.
- Normalizar email a minúsculas antes de validar/buscar/persistir; email único. Usar bcryptjs con saltRounds 12 y nunca exponer contraseña ni hash.
- Mantener el modelo `User` de Prisma existente. En MVP la cuenta queda activa con `emailVerified` nulo.
- El límite documentado para MVP es 3 intentos por IP por hora; su mecanismo operativo no está definido.
- HU-01 admite solo tema claro. El mensaje UI para email duplicado es neutral, aunque el conflicto siga identificable internamente.
- Si falla el inicio automático tras crear la cuenta, no deshacer ni invalidar la cuenta.

## Non-goals

- Enviar email de bienvenida; se difiere a una historia posterior.
- Verificar email antes de usar la cuenta; corresponde a fase posterior.
- Activar o persistir un tema oscuro.
- Construir una interfaz general de login, recuperación de contraseña o gestión amplia de sesiones como parte de HU-01. El camino mínimo de Auth.js Credentials/sesión necesario para el inicio automático tras el registro sí es una dependencia explícita.

## Success signal

Una persona nueva completa el registro, obtiene una cuenta activa sin que se expongan credenciales y alcanza el dashboard si el inicio automático funciona. Si ese inicio falla, conserva su cuenta y puede continuar al login mediante el enlace ofrecido.

## Assumptions

- Se conserva como requisito MVP el límite de 3 intentos por IP por hora de `register.md` y `SPEC_CONVENTIONS.md`; falta definir su mecanismo y disponibilidad.

## Open Questions

- ¿Qué mecanismo/almacenamiento aplica el rate limit y qué ocurre si no está disponible?
- ¿Cuál es el texto exacto, neutral, para conflicto de email y fallo de inicio automático?
- ¿Qué límites adicionales de longitud y normalización aplican a email y nombre?
- ¿Qué estados de carga, accesibilidad y comportamiento responsive deben normarse para el formulario?
