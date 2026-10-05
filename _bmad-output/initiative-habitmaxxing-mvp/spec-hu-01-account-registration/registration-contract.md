# Contrato de registro

## Historia y límites

Como usuario nuevo, quiero crear una cuenta con email y contraseña para habilitar la sincronización de mis datos. El endpoint no requiere autenticación. La bienvenida por correo queda fuera de HU-01; la cuenta MVP no requiere verificación y `emailVerified` permanece nulo.

## Entrada y persistencia

`POST /api/auth/register` recibe JSON con `email` requerido, `password` requerido y `name` opcional. Recortar espacios exteriores del email y nombre; convertir el email a minúsculas antes de validación, consulta y persistencia. El email válido admite hasta 254 caracteres. Nombre vacío tras recortar se normaliza a `null`; su máximo es 100 caracteres. La contraseña tiene mínimo 8 caracteres y máximo 72 bytes UTF-8: el servidor aplica el límite de bytes antes de bcryptjs (`saltRounds: 12`), que trunca entradas superiores. El feedback UX por caracteres es orientativo y nunca sustituye esa comprobación de bytes del servidor. El email es único. Nunca incluir contraseña ni hash en respuestas.

Se conserva el modelo `User` del esquema Prisma actual: `id` CUID, `email` único, `password` requerido, `name` opcional, `emailVerified` nulo en MVP, `failedLoginAttempts` por defecto 0, `lockedUntil` nulo, timestamps automáticos y relación `habits`. No se autoriza cambio de esquema para HU-01.

## Resultados observables

- Creación correcta: HTTP 201 y usuario sin `password`, con `id`, `email`, `name`, `createdAt`, `updatedAt` bajo `data`.
- Entrada inválida o faltante: HTTP 400, `VALIDATION_ERROR`, mensaje en español y detalles por campo.
- Email duplicado: conflicto 409 observable internamente; la interfaz muestra exactamente «No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo», sin confirmar existencia.
- La protección contra abuso y limitación de frecuencia del registro quedan fuera de HU-01 y se difieren a una futura historia de infraestructura, sin clave de tracker. No se elige ni instala proveedor.
- Fallo interno: 500 `INTERNAL_ERROR` sin detalles sensibles.

## Flujo posterior y experiencia

Tras HTTP 201, la interfaz intenta iniciar sesión con Auth.js Credentials. Si tiene éxito, redirige al dashboard. Si falla, informa «Tu cuenta fue creada, pero no pudimos iniciar sesión. Inicia sesión para continuar.» y ofrece navegación al login; no repite ni revierte la creación automáticamente. Mantener tema claro exclusivamente en este flujo. Usar el sistema visual existente para tipografía, superficies, inputs, labels, botones y estados; el contrato detallado de tokens vive en `../../../docs/specs/DESIGN_SYSTEM.md`.

## Contrato de pantalla

- Orden: correo electrónico, nombre opcional, contraseña, botón «Crear cuenta».
- Etiquetas visibles asociadas: correo `type=email`, `autocomplete=email`; nombre `autocomplete=name`; contraseña `type=password`, `autocomplete=new-password`. Etiquetar explícitamente nombre como opcional.
- Validar al perder foco y al enviar, no durante cada pulsación. Asociar error por campo con `aria-describedby` y marcar `aria-invalid`.
- Envío: anunciar «Creando cuenta…», deshabilitar el botón y evitar duplicados; conservar valores en rechazos. Los errores del servidor se muestran en español, accionables y neutrales; errores inesperados no exponen detalles internos.
- Ante datos inválidos, enfocar el primer campo erróneo y anunciar el resumen con región accesible (`role=alert` o equivalente). Anunciar estado de envío/resultado sin depender del color; foco visible, navegación completa por teclado y secuencia coherente.
- Éxito: intentar auto-inicio y navegar al dashboard. Si falla, preservar cuenta y ofrecer enlace al login con el copy definido arriba.
- Responsive: una columna, usable sin scroll horizontal desde 320 CSS px, conservando orden con zoom, reflow y orientación estrecha; ampliar el contenedor en pantallas grandes.
- Tema claro únicamente para HU-01; los tokens oscuros generales se preservan para historias futuras.

## Trazabilidad de aceptación y pruebas

- Email y contraseña válidos crean cuenta; `name` puede omitirse y se representa como nulo según el contrato actual.
- Email inválido, contraseña menor a 8 caracteres, body vacío o campos requeridos ausentes producen validación 400.
- Duplicado da conflicto interno; la UI no confirma existencia.
- Confirmar persistencia de hash no reversible en lugar de contraseña en texto plano, y ausencia del campo sensible en la respuesta.
- Protección contra abuso y limitación de frecuencia diferidas a una futura historia de infraestructura sin clave de tracker.
- Inicio automático exitoso conduce al dashboard; si falla, cuenta válida y enlace a login.

## Pendientes explícitos

La protección contra abuso queda fuera de HU-01 y se difiere a una futura historia de infraestructura sin clave de tracker; no hay decisión de mecanismo o proveedor. La arquitectura de autenticación y la implementación de `src/lib/auth.ts` son planeadas; este contrato no presume que ya existan. El envío de bienvenida se difiere a una historia futura sin clave de tracker asignada.
