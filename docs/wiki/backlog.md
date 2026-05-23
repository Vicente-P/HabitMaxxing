# 📋 Etapa 2 — Jira: Épicas, Historias de Usuario y Tareas

## 🏗️ Jerarquía de trabajo

```
🗂️ ÉPICA
   └── 📖 Historia de Usuario
            └── ✅ Tarea técnica
```

| Nivel | ¿Qué es? | Ejemplo |
|---|---|---|
| 🗂️ **Épica** | Gran área funcional del producto | "Autenticación de usuarios" |
| 📖 **Historia de Usuario** | Funcionalidad desde la perspectiva del usuario | "Como usuario quiero registrarme con email" |
| ✅ **Tarea técnica** | Trabajo técnico concreto y estimable | "Crear endpoint POST /auth/register" |

---

## 📖 ¿Cómo se escribe una Historia de Usuario?

Toda historia sigue esta fórmula:

> **"Como** [tipo de usuario] **quiero** [acción] **para** [beneficio]"

Y debe tener **Criterios de Aceptación** que definan exactamente cuándo la historia está "done":

```
Dado que [contexto]
cuando [acción]
entonces [resultado esperado]
```

> ⚠️ Los criterios de aceptación deben estar escritos desde la perspectiva del usuario, no como requisitos técnicos.

### Ejemplo

| ❌ Requisito técnico | ✅ Criterio de aceptación |
|---|---|
| "Emitir un JWT tras login exitoso" | "Dado que ingreso credenciales correctas, cuando inicio sesión, entonces accedo a mi dashboard sin volver a ingresar mis datos" |
| "Bloquear tras 5 intentos fallidos" | "Dado que ingresé 5 veces una contraseña incorrecta, cuando intento iniciar sesión nuevamente, entonces veo un mensaje indicando que mi cuenta está bloqueada temporalmente" |

---

## 📊 Story Points

Son una unidad de **esfuerzo relativo**, no de tiempo. Se usa la escala de Fibonacci:

| Story Points | Complejidad |
|---|---|
| 1 | Trivial |
| 2 | Simple |
| 3 | Moderada |
| 5 | Compleja |
| 8 | Muy compleja |
| 13 | Épica (considerar dividir) |

> 💡 Con 1-3 horas semanales, apuntar a no superar **8 SP por sprint**.

---

## 🗂️ Épicas del proyecto

| Clave | Épica | Story Points | Descripción |
|---|---|---|---|
| SCRUM-1 | 🔐 EP-01 — Autenticación y Gestión de Cuenta | 14 SP | Registro, login, recuperación y eliminación de cuenta |
| SCRUM-2 | 📝 EP-02 — Gestión de Hábitos | 8 SP | CRUD de hábitos con tipo y frecuencia configurable |
| SCRUM-3 | ✅ EP-03 — Registro Diario | 5 SP | Registro binario y numérico de hábitos |
| SCRUM-4 | 📊 EP-04 — Progreso y Estadísticas | 10 SP | Rachas, heatmap y porcentaje de cumplimiento |
| SCRUM-5 | 🎨 EP-05 — UI/UX y Diseño Responsive | 5 SP | Diseño responsive y modo oscuro |

---

## 🔐 EP-01 — Autenticación y Gestión de Cuenta

### 📖 HU-01 — Registro de cuenta `SCRUM-6`
> *"Como usuario nuevo, quiero crear una cuenta con email y contraseña, para habilitar la sincronización de mis datos."*

**Criterios de Aceptación:**
- CA-01: Dado que soy usuario nuevo, cuando ingreso email válido y contraseña de mínimo 8 caracteres, entonces mi cuenta es creada y soy redirigido al dashboard.
- CA-02: Dado que intento registrarme, cuando ingreso un email ya registrado, entonces veo "Este correo ya está en uso".
- CA-03: Dado que intento registrarme, cuando ingreso una contraseña menor a 8 caracteres, entonces veo un mensaje con los requisitos de contraseña.
- CA-04: Dado que completo el registro, cuando reviso mi bandeja de entrada, entonces recibo un email de bienvenida.

**Tareas Técnicas:**
- T-01: Crear modelo User en base de datos (email, password hash, createdAt)
- T-02: Crear endpoint POST /api/auth/register con validaciones
- T-03: Implementar hash de contraseña con bcrypt
- T-04: Crear formulario de registro en frontend con validaciones
- T-05: Configurar envío de email de bienvenida
- T-06: Escribir tests unitarios del endpoint

`Story Points: 3` `Prioridad: Alta` `Sprint: 1`

---

### 📖 HU-02 — Inicio de sesión `SCRUM-7`
> *"Como usuario registrado, quiero iniciar sesión con mis credenciales, para acceder a mi perfil y hábitos guardados."*

**Criterios de Aceptación:**
- CA-01: Dado que soy usuario registrado, cuando ingreso email y contraseña correctos, entonces accedo al dashboard con mis hábitos disponibles.
- CA-02: Dado que intento iniciar sesión, cuando ingreso credenciales incorrectas, entonces veo "Credenciales incorrectas" sin especificar cuál campo falló.
- CA-03: Dado que fallé el login 5 veces consecutivas, cuando intento iniciar sesión nuevamente, entonces veo "Cuenta bloqueada temporalmente, intenta en 15 minutos".
- CA-04: Dado que inicio sesión exitosamente, cuando cierro y vuelvo a abrir la app, entonces mi sesión sigue activa sin reingresar credenciales.

**Tareas Técnicas:**
- T-07: Crear endpoint POST /api/auth/login con validaciones
- T-08: Implementar generación y firma de JWT
- T-09: Implementar lógica de bloqueo tras 5 intentos fallidos
- T-10: Crear formulario de login en frontend con manejo de errores
- T-11: Implementar persistencia de sesión con refresh token
- T-12: Escribir tests unitarios del endpoint

`Story Points: 5` `Prioridad: Alta` `Sprint: 1`

---

### 📖 HU-03 — Cierre de sesión `SCRUM-8`
> *"Como usuario autenticado, quiero cerrar sesión, para proteger mis datos en dispositivos compartidos."*

**Criterios de Aceptación:**
- CA-01: Dado que estoy autenticado, cuando presiono "Cerrar sesión", entonces soy redirigido al login y mi sesión es invalidada.
- CA-02: Dado que cerré sesión, cuando intento acceder a una ruta protegida, entonces soy redirigido al login automáticamente.

**Tareas Técnicas:**
- T-13: Crear endpoint POST /api/auth/logout
- T-14: Implementar invalidación de token en frontend
- T-15: Redirigir a login tras cerrar sesión
- T-16: Proteger rutas privadas con middleware de autenticación

`Story Points: 1` `Prioridad: Alta` `Sprint: 1`

---

### 📖 HU-04 — Recuperación de contraseña `SCRUM-9`
> *"Como usuario que olvidó su contraseña, quiero recibir un enlace de recuperación, para restablecer el acceso a mi cuenta."*

**Criterios de Aceptación:**
- CA-01: Dado que olvidé mi contraseña, cuando ingreso mi email registrado, entonces recibo un correo con un enlace de recuperación válido por 30 minutos.
- CA-02: Dado que recibo el enlace de recuperación, cuando ingreso y confirmo mi nueva contraseña, entonces puedo iniciar sesión con la nueva contraseña.
- CA-03: Dado que el enlace de recuperación expiró, cuando intento usarlo, entonces veo "El enlace ha expirado, solicita uno nuevo".

**Tareas Técnicas:**
- T-17: Crear endpoint POST /api/auth/forgot-password
- T-18: Generar token temporal con expiración de 30 minutos
- T-19: Configurar envío de email con enlace de recuperación
- T-20: Crear endpoint POST /api/auth/reset-password
- T-21: Crear formulario de recuperación en frontend

`Story Points: 3` `Prioridad: Media` `Sprint: 2`

---

### 📖 HU-05 — Eliminación de cuenta `SCRUM-10`
> *"Como usuario, quiero poder eliminar mi cuenta, para que mis datos sean borrados permanentemente de la plataforma."*

**Criterios de Aceptación:**
- CA-01: Dado que quiero eliminar mi cuenta, cuando confirmo la acción ingresando mi contraseña, entonces mi cuenta y todos mis datos son eliminados permanentemente.
- CA-02: Dado que elimino mi cuenta, cuando intento iniciar sesión con ese email, entonces veo "No existe una cuenta con este correo".

**Tareas Técnicas:**
- T-22: Crear endpoint DELETE /api/user
- T-23: Implementar eliminación en cascada de hábitos y registros
- T-24: Solicitar confirmación con contraseña antes de eliminar
- T-25: Redirigir a pantalla de confirmación tras eliminar

`Story Points: 2` `Prioridad: Baja` `Sprint: 5`

---

## 📝 EP-02 — Gestión de Hábitos

### 📖 HU-06 — Crear hábito `SCRUM-11`
> *"Como usuario, quiero crear un hábito con nombre, tipo y días de frecuencia, para comenzar a hacer seguimiento de él."*

**Criterios de Aceptación:**
- CA-01: Dado que quiero crear un hábito, cuando ingreso nombre, tipo (binario o numérico) y selecciono los días de la semana, entonces el hábito aparece en mi dashboard.
- CA-02: Dado que creo un hábito numérico, cuando lo configuro, entonces debo poder especificar la unidad de medida (km, páginas, vasos, etc).
- CA-03: Dado que intento crear un hábito, cuando dejo el nombre vacío, entonces veo "El nombre del hábito es obligatorio".
- CA-04: Dado que creo un hábito, cuando no selecciono ningún día de la semana, entonces veo "Debes seleccionar al menos un día".

**Tareas Técnicas:**
- T-26: Crear endpoint POST /api/habits
- T-27: Validar campos requeridos con Zod
- T-28: Crear formulario de creación de hábito en frontend
- T-29: Implementar selector de días de la semana
- T-30: Escribir tests unitarios del endpoint

`Story Points: 3` `Prioridad: Alta` `Sprint: 2`

---

### 📖 HU-07 — Editar hábito `SCRUM-12`
> *"Como usuario, quiero editar un hábito existente, para corregir su nombre, tipo o frecuencia."*

**Criterios de Aceptación:**
- CA-01: Dado que quiero editar un hábito, cuando modifico su nombre, frecuencia o unidad, entonces los cambios se reflejan inmediatamente en el dashboard.
- CA-02: Dado que edito la frecuencia de un hábito, cuando elimino un día que ya tiene registros, entonces veo una advertencia "Los registros de ese día no serán eliminados".

**Tareas Técnicas:**
- T-31: Crear endpoint PATCH /api/habits/:id
- T-32: Validar campos editables con Zod
- T-33: Crear formulario de edición en frontend
- T-34: Mostrar advertencia al eliminar días con registros

`Story Points: 2` `Prioridad: Alta` `Sprint: 3`

---

### 📖 HU-08 — Eliminar hábito `SCRUM-13`
> *"Como usuario, quiero eliminar un hábito, para remover los que ya no quiero trackear."*

**Criterios de Aceptación:**
- CA-01: Dado que quiero eliminar un hábito, cuando confirmo la eliminación, entonces el hábito y todo su historial desaparecen permanentemente.
- CA-02: Dado que intento eliminar un hábito, cuando presiono eliminar, entonces veo una confirmación "¿Estás seguro? Esta acción no se puede deshacer".

**Tareas Técnicas:**
- T-35: Crear endpoint DELETE /api/habits/:id
- T-36: Implementar eliminación en cascada de HabitLogs
- T-37: Crear modal de confirmación en frontend

`Story Points: 1` `Prioridad: Media` `Sprint: 3`

---

### 📖 HU-09 — Listar hábitos en dashboard `SCRUM-14`
> *"Como usuario, quiero ver todos mis hábitos en el dashboard, para tener una visión general de mi día."*

**Criterios de Aceptación:**
- CA-01: Dado que accedo al dashboard, cuando es un día en que tengo hábitos programados, entonces veo únicamente los hábitos de ese día con su estado actual.
- CA-02: Dado que accedo al dashboard, cuando no tengo hábitos creados, entonces veo un mensaje "Crea tu primer hábito para comenzar".
- CA-03: Dado que tengo hábitos en el dashboard, cuando un hábito ya fue completado hoy, entonces aparece visualmente diferenciado de los pendientes.

**Tareas Técnicas:**
- T-38: Crear endpoint GET /api/habits con filtro por día
- T-39: Crear componente de lista de hábitos en frontend
- T-40: Diferenciar visualmente hábitos completados de pendientes
- T-41: Mostrar estado vacío cuando no hay hábitos

`Story Points: 2` `Prioridad: Alta` `Sprint: 2`

---

## ✅ EP-03 — Registro Diario

### 📖 HU-10 — Registrar hábito binario `SCRUM-15`
> *"Como usuario, quiero marcar un hábito binario como completado, para registrar que lo cumplí hoy."*

**Criterios de Aceptación:**
- CA-01: Dado que tengo un hábito binario pendiente, cuando presiono el botón de completar, entonces el hábito cambia visualmente a "completado" y se guarda el registro con la fecha actual.
- CA-02: Dado que marqué un hábito como completado, cuando presiono nuevamente, entonces el registro se revierte a "pendiente".

**Tareas Técnicas:**
- T-42: Crear endpoint POST /api/habits/:id/logs
- T-43: Implementar toggle de completado en frontend
- T-44: Guardar registro con fecha actual en HabitLog
- T-45: Escribir tests unitarios del endpoint

`Story Points: 2` `Prioridad: Alta` `Sprint: 3`

---

### 📖 HU-11 — Registrar hábito numérico `SCRUM-16`
> *"Como usuario, quiero ingresar un valor numérico en mi hábito, para registrar cuánto realicé ese día."*

**Criterios de Aceptación:**
- CA-01: Dado que tengo un hábito numérico, cuando ingreso un valor y confirmo, entonces el registro se guarda con el valor y la unidad configurada (ej. "5 km").
- CA-02: Dado que registro un hábito numérico, cuando ingreso un valor negativo o cero, entonces veo "El valor debe ser mayor a 0".
- CA-03: Dado que ya registré un valor hoy, cuando ingreso un nuevo valor, entonces el registro anterior es reemplazado.

**Tareas Técnicas:**
- T-46: Extender endpoint POST /api/habits/:id/logs para valores numéricos
- T-47: Validar que el valor sea mayor a 0 con Zod
- T-48: Crear input numérico con unidad en frontend
- T-49: Implementar lógica de reemplazo de registro del día

`Story Points: 3` `Prioridad: Alta` `Sprint: 3`

---

## 📊 EP-04 — Progreso y Estadísticas

### 📖 HU-12 — Ver racha actual `SCRUM-17`
> *"Como usuario, quiero ver la racha actual de cada hábito, para mantenerme motivado a no romperla."*

**Criterios de Aceptación:**
- CA-01: Dado que completé un hábito varios días consecutivos, cuando veo el detalle del hábito, entonces veo "🔥 Racha actual: X días".
- CA-02: Dado que rompí mi racha, cuando veo el detalle del hábito, entonces la racha vuelve a 0 y veo "Racha anterior: X días".
- CA-03: Dado que tengo días no programados, cuando calculo la racha, entonces los días no programados no rompen ni suman a la racha.

**Tareas Técnicas:**
- T-50: Implementar lógica de cálculo de racha en backend
- T-51: Crear endpoint GET /api/habits/:id/streak
- T-52: Mostrar racha actual en el detalle del hábito
- T-53: Escribir tests unitarios de la lógica de racha

`Story Points: 3` `Prioridad: Alta` `Sprint: 4`

---

### 📖 HU-13 — Ver calendario heatmap `SCRUM-18`
> *"Como usuario, quiero ver un calendario visual del mes, para identificar mis días de cumplimiento e incumplimiento."*

**Criterios de Aceptación:**
- CA-01: Dado que accedo al detalle de un hábito, cuando veo el calendario del mes actual, entonces cada día programado aparece en verde (cumplido) o rojo (no cumplido).
- CA-02: Dado que veo el calendario, cuando un día no estaba programado para ese hábito, entonces aparece en gris neutro sin penalización.
- CA-03: Dado que veo el calendario, cuando presiono un día pasado, entonces veo el detalle del registro de ese día.

**Tareas Técnicas:**
- T-54: Crear endpoint GET /api/habits/:id/logs?month=YYYY-MM
- T-55: Crear componente de calendario heatmap en frontend
- T-56: Colorear días según estado (verde/rojo/gris)
- T-57: Mostrar detalle al presionar un día

`Story Points: 5` `Prioridad: Alta` `Sprint: 4`

---

### 📖 HU-14 — Ver porcentaje de cumplimiento `SCRUM-19`
> *"Como usuario, quiero ver mi porcentaje de cumplimiento mensual por hábito, para evaluar mi constancia."*

**Criterios de Aceptación:**
- CA-01: Dado que veo el detalle de un hábito, cuando reviso el mes actual, entonces veo "Cumplimiento: X% este mes" calculado solo sobre días programados transcurridos.
- CA-02: Dado que el mes acaba de comenzar, cuando no tengo registros aún, entonces veo "Cumplimiento: 0% — ¡Empieza hoy!".

**Tareas Técnicas:**
- T-58: Implementar cálculo de porcentaje en backend
- T-59: Crear endpoint GET /api/habits/:id/completion?month=YYYY-MM
- T-60: Mostrar porcentaje en el detalle del hábito

`Story Points: 2` `Prioridad: Media` `Sprint: 5`

---

## 🎨 EP-05 — UI/UX y Diseño Responsive

### 📖 HU-15 — Navegación responsive `SCRUM-20`
> *"Como usuario, quiero que la app funcione correctamente en móvil y desktop, para acceder desde cualquier dispositivo."*

**Criterios de Aceptación:**
- CA-01: Dado que accedo desde un móvil, cuando navego por la app, entonces todos los elementos son accesibles sin necesidad de hacer zoom.
- CA-02: Dado que accedo desde desktop, cuando uso la app, entonces el layout aprovecha el espacio horizontal disponible.

**Tareas Técnicas:**
- T-61: Implementar layout responsive con Tailwind CSS
- T-62: Probar en viewport móvil (375px) y desktop (1280px)
- T-63: Implementar navegación adaptable (hamburger en móvil)

`Story Points: 3` `Prioridad: Alta` `Sprint: 5`

---

### 📖 HU-16 — Modo oscuro `SCRUM-21`
> *"Como usuario, quiero poder alternar entre modo claro y oscuro, para usar la app cómodamente en cualquier entorno."*

**Criterios de Aceptación:**
- CA-01: Dado que estoy en la app, cuando activo el modo oscuro, entonces toda la interfaz cambia al tema oscuro y mi preferencia se guarda.
- CA-02: Dado que guardé la preferencia de modo oscuro, cuando vuelvo a abrir la app, entonces inicia directamente en modo oscuro.

**Tareas Técnicas:**
- T-64: Configurar dark mode en Tailwind CSS
- T-65: Crear toggle de tema en la interfaz
- T-66: Persistir preferencia en localStorage

`Story Points: 2` `Prioridad: Baja` `Sprint: 5`

---

## 📊 Resumen del Backlog

| Épica | Historias | Story Points | Sprint |
|---|---|---|---|
| 🔐 EP-01 Autenticación | HU-01 a HU-05 | 14 SP | 1, 2, 5 |
| 📝 EP-02 Gestión Hábitos | HU-06 a HU-09 | 8 SP | 2, 3 |
| ✅ EP-03 Registro Diario | HU-10 a HU-11 | 5 SP | 3 |
| 📊 EP-04 Progreso | HU-12 a HU-14 | 10 SP | 4, 5 |
| 🎨 EP-05 UI/UX | HU-15 a HU-16 | 5 SP | 5 |
| **Total** | **16 historias** | **42 SP** | **5 sprints** |

---

## 🗓️ Planificación de Sprints

| Sprint | Historias | Story Points | Objetivo |
|---|---|---|---|
| Sprint 1 | HU-01, HU-02, HU-03 | 9 SP | Auth básica funcionando |
| Sprint 2 | HU-04, HU-06, HU-09 | 8 SP | Recuperar contraseña + CRUD hábitos |
| Sprint 3 | HU-07, HU-08, HU-10, HU-11 | 8 SP | Editar/eliminar + registro diario |
| Sprint 4 | HU-12, HU-13 | 8 SP | Rachas + Heatmap |
| Sprint 5 | HU-14, HU-15, HU-16, HU-05 | 9 SP | Estadísticas + Responsive + Polish |

---

## 🔗 Referencias

- [Jira — Habit Tracker Project](https://vperezc18.atlassian.net/browse/SCRUM)
- [Conventional Commits](https://www.conventionalcommits.org/)