"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { clearOfflineCaches } from "@/lib/offline-cache";
import { pendingRuntime } from "@/lib/offline-logs/pending-runtime";

export default function LogoutButton() {
  const router = useRouter();
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { pending: pendingLogs } = useSyncExternalStore(pendingRuntime.subscribe, pendingRuntime.getSnapshot, pendingRuntime.getSnapshot);
  const unsynced = pendingLogs.length;
  const warnUnsynced = confirmDiscard && unsynced > 0;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function logout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFailed(false);
    try {
      // ADR-08 §8: sync first; if changes remain, require a second explicit click to discard them.
      if (pendingRuntime.getSnapshot().pending.length > 0) {
        if (warnUnsynced) {
          await pendingRuntime.discardAll();
        } else {
          await pendingRuntime.sync();
          if (pendingRuntime.getSnapshot().pending.length > 0) {
            if (mounted.current) setConfirmDiscard(true);
            return;
          }
        }
      }
      if (mounted.current) setConfirmDiscard(false);
      await signOut({ redirect: false, redirectTo: "/login" });
      if (!mounted.current) return;
      // Native getSession collapses transport errors to null; require an explicit successful response.
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      });
      if (!response.ok || response.redirected || await response.json() !== null) {
        throw new Error("Logout not confirmed");
      }
      await clearOfflineCaches();
      if (mounted.current) router.replace("/login");
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      inFlight.current = false;
      if (mounted.current) setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={logout} disabled={pending}
        className="btn-secondary">
        {pending ? "Cerrando sesión…" : warnUnsynced ? "Cerrar sesión y descartar" : "Cerrar sesión"}
      </button>
      {warnUnsynced ? <p role="alert" className="field-error">Tienes {unsynced} {unsynced === 1 ? "cambio sin sincronizar" : "cambios sin sincronizar"}. Si cierras sesión se perderán.</p> : null}
      {failed ? <p role="alert" className="field-error">No pudimos confirmar el cierre de sesión. Inténtalo de nuevo.</p> : null}
    </div>
  );
}
