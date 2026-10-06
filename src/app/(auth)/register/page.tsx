"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { registerSchema } from "@/lib/validations";

const neutralError = "No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo";

export default function RegisterPage() {
  type Field = "email" | "name" | "password";
  const [values, setValues] = useState({ email: "", name: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const inputRefs = useRef<Record<Field, HTMLInputElement | null>>({ email: null, name: null, password: null });

  function focusField(field: Field) {
    inputRefs.current[field]?.focus();
  }

  function validate() {
    const result = registerSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "form");
      next[field] ??= issue.message;
    }
    setErrors(next);
    setStatus("Revisa los campos indicados.");
    const firstInvalidField = (["email", "name", "password"] as const).find((field) => field in next);
    if (firstInvalidField) focusField(firstInvalidField);
    return null;
  }

  function validateField(field: Field) {
    const result = registerSchema.shape[field].safeParse(values[field]);
    setErrors((current) => {
      const next = { ...current };
      if (result.success) delete next[field];
      else next[field] = result.error.issues[0]?.message ?? "Valor inválido";
      return next;
    });
    if (!result.success) setStatus("Revisa los campos indicados.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = validate();
    if (!data) return;
    setPending(true);
    setStatus("Creando cuenta…");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: { details?: Array<{ field?: string; message?: string }> } } | null;
        if (response.status === 400) {
          const details = body?.error?.details;
          if (Array.isArray(details)) {
            setErrors((current) => ({
              ...current,
              ...details.reduce<Record<string, string>>((next, detail) => {
                if (detail.field && detail.message) next[detail.field] = detail.message;
                return next;
              }, {}),
            }));
          }
        }
        setStatus(response.status === 409 ? neutralError : response.status === 400 ? "Revisa los campos indicados." : "Ocurrió un error. Inténtalo de nuevo.");
        return;
      }
      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (result?.ok) {
        window.location.assign("/dashboard");
      } else {
        setStatus("Tu cuenta fue creada, pero no pudimos iniciar sesión. Inicia sesión para continuar.");
      }
    } catch {
      setStatus("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="page-container">
      <h1 className="mb-6">Crear cuenta</h1>
      <form className="mx-auto max-w-md space-y-4" onSubmit={submit} noValidate>
        <div role="alert" aria-live="polite">{status}</div>
        {(["email", "name", "password"] as const).map((field) => {
          const labels = { email: "Correo electrónico", name: "Nombre (opcional)", password: "Contraseña" };
          const autocomplete = { email: "email", name: "name", password: "new-password" };
          return <div key={field} className="space-y-1.5">
            <label className="label" htmlFor={field}>{labels[field]}</label>
            <input ref={(element) => { inputRefs.current[field] = element; }} className={errors[field] ? "input-error" : "input"} id={field} name={field} type={field === "password" ? "password" : field} autoComplete={autocomplete[field]} value={values[field]} onChange={(e) => setValues((current) => ({ ...current, [field]: e.target.value }))} onBlur={() => validateField(field)} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} />
            {errors[field] && <p className="field-error" id={`${field}-error`}>{errors[field]}</p>}
          </div>;
        })}
        <button className="btn-primary w-full" type="submit" disabled={pending} onMouseDown={(event) => event.preventDefault()}>{pending ? "Creando cuenta…" : "Crear cuenta"}</button>
      </form>
      <p className="mx-auto mt-4 max-w-md"><Link href="/login">¿Ya tienes una cuenta? Inicia sesión</Link></p>
    </main>
  );
}
