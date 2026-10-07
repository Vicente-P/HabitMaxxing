"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

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
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {failed ? <p role="alert">No pudimos confirmar el cierre de sesión. Inténtalo de nuevo.</p> : null}
    </div>
  );
}
