"use client";

import { useSyncExternalStore } from "react";
import { pendingRuntime } from "@/lib/offline-logs/pending-runtime";
import AuthIcon from "./(auth)/auth-icons";

function subscribe(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** Warns that what is on screen may be stale, and reports changes waiting to sync (HU-19 CA-02, HU-20). */
export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const { pending, discarded, unauthorized } = useSyncExternalStore(pendingRuntime.subscribe, pendingRuntime.getSnapshot, pendingRuntime.getSnapshot);
  const showStatus = !online || pending.length > 0 || unauthorized;
  if (!showStatus && discarded.length === 0) return null;

  return (
    <>
      {showStatus && (
        <div role="status" className="flex flex-col gap-1 border-b border-hm-border-lo bg-hm-warn-soft px-4 py-2 text-hm-caption font-medium text-hm-warn">
          {!online && (
            <p className="flex items-center gap-2">
              <AuthIcon name="alert" size={14} />
              Sin conexión: puede que los datos no estén al día.
            </p>
          )}
          {pending.length > 0 && (
            <p>{pending.length} {plural(pending.length, "cambio pendiente", "cambios pendientes")} de sincronizar.</p>
          )}
          {unauthorized && <p>Tu sesión terminó: los cambios pendientes se enviarán cuando inicies sesión de nuevo.</p>}
        </div>
      )}
      {discarded.length > 0 && (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-hm-border-lo bg-hm-warn-soft px-4 py-2 text-hm-caption font-medium text-hm-danger">
          <p>No se pudo aplicar {discarded.length} {plural(discarded.length, "cambio", "cambios")} porque el hábito ya no existe o no estaba programado ese día.</p>
          <button type="button" onClick={pendingRuntime.dismissDiscarded} className="btn-secondary shrink-0">Entendido</button>
        </div>
      )}
    </>
  );
}
