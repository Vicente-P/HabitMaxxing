"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import AuthAlert from "../auth-alert";
import AuthField from "../auth-field";
import AuthIcon from "../auth-icons";
import AuthShell from "../auth-shell";

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
      if (result?.ok && !result.error) window.location.assign("/dashboard");
      else setError("Credenciales incorrectas");
    } catch {
      setError("No se pudo iniciar sesión con esos datos.");
    } finally {
      setPending(false);
    }
  }

  return <AuthShell mode="login">
    <h1 className="mb-6">Iniciar sesión</h1>
    <form className="space-y-4" onSubmit={submit}>
      <AuthAlert>{error}</AuthAlert>
      <AuthField id="email" label="Correo electrónico" icon="mail" type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthField id="password" label="Contraseña" icon="lock" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button className="btn-primary w-full" type="submit" disabled={pending}>{pending ? "Iniciando sesión…" : <>Iniciar sesión <AuthIcon name="arrowRight" size={15} className="stroke-[2.2]" /></>}</button>
    </form>
    <p className="mt-6 text-center text-hm-caption"><Link href="/register">Crear una cuenta</Link></p>
  </AuthShell>;
}
