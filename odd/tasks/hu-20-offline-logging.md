# HU-20 — Registro sin conexión
Rama `feature/pwa-registro-offline`, apilada sobre `develop` (1ad3ab6+). ADR: `docs/architecture/decisions/ADR-08-registro-sin-conexion.md` (aceptado por el usuario el 2026-11-06).

## Specs
- S1: "Debe funcionar sin internet" (L1).
- S2: CA-01 "Dado que estoy sin conexión, cuando marco o registro un hábito, entonces el cambio se ve de inmediato y queda pendiente."
- S3: CA-02 "Dado que vuelve la conexión, entonces los cambios pendientes se sincronizan sin duplicarse ni desmarcarse."
- S4: la API y el modelo de datos no cambian; `POST /api/habits/:id/logs` ya es idempotente (ADR-08 §1).
- S5: la fecha enviada es siempre la `meta.date` de la agenda mostrada; con una agenda de otro día no se registra sin conexión (ADR-08 §3, §5).
- S6: al cerrar sesión con pendientes se avisa y se exige confirmar para descartarlos; la cola nunca se reproduce para otro usuario (ADR-08 §8).

## Tasks
- [x] T1 (S2, S3, S5) — `PendingLogStore` (interfaz, memoria, IndexedDB) + coalescencia por `ownerId+habitId+date` — inline
- [x] T2 (S3, S5) — motor de sincronización (2xx, 400/404, 401, red/5xx) con store y fetch inyectados — inline
- [x] T3 (S2, S5) — agenda: encolar ante fallo de red, marca "Pendiente", salvaguarda de día, recarga tras sincronizar — inline
- [x] T4 (S3, S6) — disparadores de sincronización, contador en el aviso y guarda en el cierre de sesión — inline
- [x] T5 (S1–S3, S6) — E2E con la red cortada: marcar, reconectar, sin duplicar; guarda de logout — inline
- [x] T6 — docs: ADR a "Aceptado", backlog HU-20, guía de pruebas en dispositivo — inline

## Log
- L1 (usuario): "Quiero que la aplicación este en el inicio del celular y sea un acceso directo. Que no se vea como navegador, pero tambien me gustaría agregar notificaiones o recordatorios. Debe funcionar sin internet"
- L2 (usuario): "sigamos con hu20"
- L3 (usuario): "Sí" (aprueba ADR-08 completo, incluida la guarda de logout).
- L4 (agente): corrección: el log binario NO es un toggle en la API; ya fija el estado. Se retira el supuesto de cambiar el contrato (backlog y ADR-08 actualizados).
- L5 (agente): T1-T2 y T3-T4 las implementó un worker (context backstop), verificadas por el padre: 808 unit, tsc, eslint y 25 E2E. La marca "Pendiente de sincronizar" y el contador del aviso no están en el mockup (excepción mínima, avisada al usuario).
