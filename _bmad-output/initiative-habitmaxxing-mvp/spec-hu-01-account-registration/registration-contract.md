# Contrato de registro

## Historia y límites

Como usuario nuevo, quiero crear una cuenta con email y contraseña para habilitar la sincronización de mis datos. El endpoint no requiere autenticación. La bienvenida por correo queda fuera de HU-01; la cuenta MVP no requiere verificación y `emailVerified` permanece nulo.

## Entrada y persistencia

`POST /api/auth/register` recibe JSON con `email` requerido en formato válido, `password` requerido de al menos 8 caracteres y `name` opcional de máximo 100 caracteres. Normalizar el email a minúsculas antes de validación, consulta y persistencia. El email es único. Hashear la contraseña con bcryptjs (`saltRounds: 12`) antes de persistirla; nunca incluir contraseña ni hash en respuestas.

Se conserva el modelo `User` del esquema Prisma actual: `id` CUID, `email` único, `password` requerido, `name` opcional, `emailVerified` nulo en MVP, `failedLoginAttempts` por defecto 0, `lockedUntil` nulo, timestamps automáticos y relación `habits`. No se autoriza cambio de esquema para HU-01.

## Resultados observables

- Creación correcta: HTTP 201 y usuario sin `password`, con `id`, `email`, `name`, `createdAt`, `updatedAt` bajo `data`.
- Entrada inválida o faltante: HTTP 400, `VALIDATION_ERROR`, mensaje en español y detalles por campo.
- Email duplicado: conflicto 409 observable internamente; interfaz muestra mensaje neutral que no confirma existencia. El texto exacto queda abierto.
- Rate limit: 429 `ACCOUNT_LOCKED` tras 3 intentos por IP en una hora según las convenciones actuales. El mecanismo y la indisponibilidad no están especificados.
- Fallo interno: 500 `INTERNAL_ERROR` sin detalles sensibles.

## Flujo posterior y experiencia

Tras HTTP 201, la interfaz intenta iniciar sesión con Auth.js Credentials. Si tiene éxito, redirige al dashboard. Si falla, informa que la cuenta ya fue creada y ofrece navegación al login; no repite ni revierte la creación automáticamente. Mantener tema claro exclusivamente en este flujo. Usar el sistema visual existente para tipografía, superficies, inputs, labels, botones y estados; el contrato detallado de tokens vive en `../../../../docs/specs/DESIGN_SYSTEM.md`.

## Trazabilidad de aceptación y pruebas

- Email y contraseña válidos crean cuenta; `name` puede omitirse y se representa como nulo según el contrato actual.
- Email inválido, contraseña menor a 8 caracteres, body vacío o campos requeridos ausentes producen validación 400.
- Duplicado da conflicto interno; la UI no confirma existencia.
- Confirmar persistencia de hash no reversible en lugar de contraseña en texto plano, y ausencia del campo sensible en la respuesta.
- Registro limitado a tres intentos por IP por hora.
- Inicio automático exitoso conduce al dashboard; si falla, cuenta válida y enlace a login.

## Pendientes explícitos

No están definidos el proveedor/almacenamiento del rate limit, el comportamiento ante falla de dicho mecanismo, el copy final neutral, reglas adicionales para nombre/email ni el detalle accesible/responsive de estados del formulario. La arquitectura de autenticación se describe como planeada y la implementación de `src/lib/auth.ts` está pendiente en el documento fuente; este contrato no presume que ya exista.
