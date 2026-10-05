"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.ok) window.location.assign("/dashboard");
      else setError("No se pudo iniciar sesión con esos datos.");
    } catch {
      setError("No se pudo iniciar sesión con esos datos.");
    } finally {
      setPending(false);
    }
  }

  return <main className="page-container">
    <h1 className="mb-6">Iniciar sesión</h1>
    <form className="mx-auto max-w-md space-y-4" onSubmit={submit}>
      <div role="alert" aria-live="polite">{error}</div>
      <div className="space-y-1.5">
        <label className="label" htmlFor="email">Correo electrónico</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <label className="label" htmlFor="password">Contraseña</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button className="btn-primary w-full" type="submit" disabled={pending}>{pending ? "Iniciando sesión…" : "Iniciar sesión"}</button>
    </form>
    <p className="mx-auto mt-4 max-w-md"><Link href="/register">Crear una cuenta</Link></p>
  </main>;
}
