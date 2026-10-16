# Endpoint: Inicio de sesión

## Metadata

| Campo | Valor |
|-------|-------|
| **Jira** | [SCRUM-7](https://vperezc18.atlassian.net/browse/SCRUM-7) / HU-02 |
| **Épica** | SCRUM-1 / EP-01 — Autenticación y Gestión de Cuenta |
| **Story Points** | 5 |
| **Autenticación** | No requerida |

## Descripción

Autentica a un usuario registrado mediante Auth.js Credentials y su cookie de sesión JWT. **Estado (2026-10-06): etapa de autenticación aceptada localmente.** La etapa A cubre login y dashboard protegido; la etapa B de hábitos guardados queda diferida a HU-06/lectura autenticada. El CA-01 original completo sigue pendiente.

> **Decisiones aprobadas 2026-10-06:** transporte nativo Auth.js, fallo externo uniforme incluso durante bloqueo, protección servidor propiedad de HU-02 y aceptación por etapas. No se implementa wrapper `/api/auth/login`, firma JWT manual ni refresh-token paralelo. [Plan y evidencia HU-02](../../../_bmad-output/initiative-habitmaxxing-mvp/plan-hu-02-login.md).

---

## Request

### Transporte nativo Auth.js

```
POST /api/auth/callback/credentials
```

Gestionado por el handler de Auth.js en `src/app/api/auth/[...nextauth]/route.ts`.

El cliente usa `signIn("credentials", { email, password, redirect: false })`; Auth.js gestiona formato, CSRF y cookies. La tabla siguiente describe entradas lógicas, no un contrato JSON REST adicional.

### Entradas

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `email` | `string` | Sí | Formato email válido |
| `password` | `string` | Sí | No vacío |

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña-segura"
}
```

---

## Resultado y errores

El cliente solo considera éxito `result?.ok && !result.error`; una respuesta HTTP 200 con `CredentialsSignin` no acredita autenticación. La aceptación debe verificar además una sesión real. Los antiguos ejemplos REST 400/401 son ilustrativos y no imponen estados ni envoltorios `data/error` a Auth.js.

- Email desconocido, contraseña incorrecta y cuenta bloqueada: mismo rechazo del provider y mensaje **"Credenciales incorrectas"**, sin identificar campo, cuenta o bloqueo.
- Entradas inválidas: rechazadas por `loginSchema` antes de consultar la DB; no se exige un HTTP 400 propio.
- Fallo de infraestructura: cierre seguro y feedback neutral; no exponer mensajes internos.
- El antiguo HTTP 429/`ACCOUNT_LOCKED` y texto específico de bloqueo quedan supersedidos por la decisión de privacidad; no son contrato vigente.

## Política interna y sesión

Cinco fallos consecutivos admitidos establecen un bloqueo de 15 minutos. Durante el bloqueo no se autentica ni extiende el plazo, incluso con contraseña correcta. Al llegar a `now >= lockedUntil` comienza una secuencia nueva; un éxito desbloqueado reinicia contador y bloqueo.

La decisión se ejecuta en transacción Serializable con hasta tres intentos, reintentando solo conflictos Prisma P2034 reales. El rechazo se devuelve desde la transacción para confirmar el contador antes de rechazar el provider. Los errores inesperados y el agotamiento fallan de forma cerrada. Las pruebas con mocks no acreditan aislamiento PostgreSQL real.

`session.maxAge` está explícitamente configurado en 2.592.000 segundos (30 días). Auth.js deriva de él la vigencia JWT/cookie y renueva su expiración al acceder a la sesión. No es un plazo fijo personalizado; A2 verificó reinicio real de Chrome y cookie persistente HttpOnly/SameSite=Lax. Secure=false es esperado en HTTP local, no prueba de Secure en producción ni de 30 días transcurridos.

## Sesión activa

```
GET /api/auth/session
```

Retorna la sesión activa o `null` si no hay sesión.

**Con sesión:**

```json
{
  "user": {
    "id": "clx7k2m9n0000qz8f3abc1234",
    "email": "usuario@ejemplo.com",
    "name": "Vicente"
  },
  "expires": "2026-06-22T10:30:00.000Z"
}
```

**Sin sesión:**

```json
null
```

---

## Criterios de aceptación (Jira)

- **CA-01 etapa A:** credenciales correctas establecen sesión y acceso al dashboard protegido; aceptación aislada local observada. **Etapa B:** hábitos guardados diferidos a HU-06/lectura autenticada; no completar el CA-01 original con el placeholder.
- **CA-02:** Dado que intento iniciar sesión, cuando ingreso credenciales incorrectas, entonces veo "Credenciales incorrectas" sin especificar cuál campo falló.
- **CA-03 ajustado:** cinco fallos consecutivos bloquean internamente durante 15 minutos; cuentas desconocidas, contraseña incorrecta y cuentas bloqueadas muestran "Credenciales incorrectas". Expiración y reinicio tras éxito se preservan.
- **CA-04:** Dado que inicio sesión exitosamente, cuando cierro y vuelvo a abrir la app, entonces mi sesión sigue activa sin reingresar credenciales.

---

## Pruebas y aceptación local

Las pruebas deterministas observadas cubren política, formulario, configuración/callbacks y límite servidor; no equivalen a aceptación integrada. Último candidato de código: 51 tests y typecheck/lint/build/diff con salida 0; evidencia y límites en el plan.

- [x] Pruebas deterministas: umbral, bloqueo activo sin extensión, expiración exacta, reinicio, fallos y ordenamientos concurrentes controlados.
- [x] Mismo rechazo externo; feedback neutral, errores semánticos, estado pendiente y recuperación HU-01 preservados.
- [x] Configuración de 30 días, identidad segura y guard servidor; sin contraseña/hash/contador en payloads de prueba.
- [x] **A1:** PostgreSQL 16 local aislado: persistencia, bloqueo/expiración/reinicio y carreras reales; seis conflictos P2034 observados y recuperados en reintentos acotados.
- [x] **A2:** Chrome real: rechazo uniforme, sesión segura, acceso protegido, cookie HttpOnly/SameSite=Lax con vencimiento mayor a 29 días, cierre/reapertura de proceso con el mismo perfil, teclado y 320 px. Secure en producción y 30 días transcurridos no fueron probados.
- [ ] Etapa B: hábitos reales disponibles; dependencia no implementada.

## Notas de implementación

- Provider `Credentials` existente en `src/lib/auth.ts`; política en `src/lib/login-policy.ts`.
- Comparar password con `bcrypt.compare()` contra el hash en DB.
- Normalizar email a minúsculas antes de buscar en DB (ver [SPEC_CONVENTIONS — Normalización de email](../SPEC_CONVENTIONS.md)).
- Contador de intentos fallidos: almacenado en campos `failedLoginAttempts` y `lockedUntil` del modelo `User`. Clave de bloqueo = email.
- Auth.js gestiona la cookie de sesión; no emitir JWT manualmente.
- HU-02 protege `src/app/(dashboard)/dashboard/page.tsx` con `auth()` antes de devolver contenido; sesiones sin ID válido redirigen a `/login`, excepciones no renderizan contenido. HU-03 reutiliza el guard; su logout/verificación posterior no están implementados.
- Duración nativa renovable: 30 días explícitos en `src/lib/auth.ts`, sin gestionar cookies manualmente.

## Notas de seguridad

- Mensaje genérico en fallo de login para no revelar existencia de emails.
- Resetear `failedLoginAttempts` a `0` y `lockedUntil` a `null` tras login exitoso.
- A2 local acreditó HttpOnly/SameSite=Lax y persistencia; `secure` en HTTPS de producción sigue sin comprobarse. El bloqueo no revoca sesiones JWT ya emitidas.

---

Aceptación aislada sobre `a7bb421`, dos ejecuciones con salida 0; detalles, límites y limpieza en el plan. No constituye aprobación de seguridad ni aceptación en producción. Se retuvo un directorio temporal/perfil local porque su eliminación fue bloqueada por política; sin reintento ni bypass.

## Modelo relacionado

- [user.md](../models/user.md)
