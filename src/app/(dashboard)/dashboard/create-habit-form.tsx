"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createHabitSchema } from "@/features/habits";

export const weekdayLabels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
type Field = "name" | "unit" | "frequency";
export type EditableHabit = { id: string; name: string; type: "BINARY" | "NUMERIC"; unit: string | null; frequency: number[] };
type Props = {
  onCreated?: () => void | Promise<unknown>; onUnauthorized?: () => void;
  /** Edit mode: when set, the form updates this habit instead of creating one. */
  habit?: EditableHabit; onSaved?: () => void | Promise<unknown>; onCancel?: () => void;
};
const editFailures: Record<number, string> = {
  404: "Este hábito ya no está disponible. Actualiza Mis hábitos.",
  400: "No se pudo guardar. Revisa los datos y vuelve a intentarlo.",
};
const editUncertainMessage = "No pudimos confirmar los cambios. Revisa Mis hábitos y vuelve a intentarlo.";
const removedDaysMessage = "Los registros de ese día no serán eliminados";

function removedDaysWarning(body: unknown): number[] | null {
  if (!body || typeof body !== "object" || !("warnings" in body) || !Array.isArray(body.warnings)) return null;
  for (const warning of body.warnings as unknown[]) {
    if (warning && typeof warning === "object" && "code" in warning && warning.code === "FREQUENCY_DAYS_REMOVED" && "removedDays" in warning && Array.isArray(warning.removedDays)) {
      return warning.removedDays.filter((day: unknown): day is number => Number.isInteger(day) && (day as number) >= 0 && (day as number) <= 6);
    }
  }
  return null;
}
const uncertainMessage = "No pudimos confirmar la creación. Revisa Mis hábitos antes de reintentar. Un reintento podría crear un duplicado.";

export default function CreateHabitForm({ onCreated, onUnauthorized, habit, onSaved, onCancel }: Props) {
  const editing = habit !== undefined;
  const [name, setName] = useState(habit?.name ?? "");
  const [type, setType] = useState<"BINARY" | "NUMERIC">(habit?.type ?? "BINARY");
  const [unit, setUnit] = useState(habit?.unit ?? "");
  const [frequency, setFrequency] = useState<number[]>(habit ? [...habit.frequency] : []);
  const [warning, setWarning] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const locked = useRef(false);
  const active = useRef(true);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; controller.current?.abort(); };
  }, []);

  useEffect(() => { if (editing) nameInput.current?.focus(); }, [editing]);
  // The mobile "+" links to /habits#crear-habito: landing there focuses Nombre.
  useEffect(() => { if (window.location.hash === "#crear-habito") nameInput.current?.focus(); }, []);

  function showErrors(nextErrors: Partial<Record<Field, string>>, form: HTMLFormElement) {
    setErrors(nextErrors);
    const first = (["name", "unit", "frequency"] as const).find((field) => nextErrors[field]);
    const target = first === "frequency" ? "weekday-0" : first;
    if (target) (form.elements.namedItem(target) as HTMLElement | null)?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const form = event.currentTarget;
    const input = { name, type, frequency, ...(type === "NUMERIC" ? { unit } : {}) };
    const parsed = createHabitSchema.safeParse(input);
    setMessage(""); setSuccess(false); setWarning("");
    if (!parsed.success) {
      const nextErrors: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "unit" || field === "frequency") nextErrors[field] ??= issue.message;
      }
      showErrors(nextErrors, form);
      return;
    }
    setErrors({}); locked.current = true; setPending(true);
    controller.current = new AbortController();
    if (habit) {
      try {
        const { type: _type, ...changes } = parsed.data;
        void _type;
        const response = await fetch(`/api/habits/${encodeURIComponent(habit.id)}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes), credentials: "same-origin", cache: "no-store",
          redirect: "error", signal: controller.current.signal,
        });
        if (!active.current) return;
        if (response.status === 401) {
          setMessage("Tu sesión ya no está disponible. Inicia sesión nuevamente.");
          onUnauthorized?.();
          return;
        }
        if (response.status !== 200) {
          setMessage(editFailures[response.status] ?? editUncertainMessage);
          return;
        }
        const body: unknown = await response.json().catch(() => null);
        if (!active.current) return;
        const removed = removedDaysWarning(body);
        setSuccess(true); setMessage("Cambios guardados.");
        if (removed) setWarning(`${removedDaysMessage}${removed.length ? ` (${removed.map((day) => weekdayLabels[day]).join(", ")})` : ""}`);
        try { void Promise.resolve(onSaved?.()).catch(() => undefined); } catch { /* the catalog reports its own load errors */ }
      } catch {
        if (active.current) setMessage(editUncertainMessage);
      } finally {
        locked.current = false;
        if (active.current) setPending(false);
      }
      return;
    }
    try {
      const response = await fetch("/api/habits", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data), credentials: "same-origin", cache: "no-store",
        redirect: "error", signal: controller.current.signal,
      });
      if (!active.current) return;
      if (response.status === 401) {
        setMessage("Tu sesión ya no está disponible. Inicia sesión nuevamente.");
        onUnauthorized?.();
        return;
      }
      if (response.status !== 201) {
        setMessage(response.status >= 500 || response.ok ? uncertainMessage : "No se pudo crear el hábito. Revisa los datos y vuelve a intentarlo.");
        return;
      }
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("data" in body) || !body.data || typeof body.data !== "object" || !("id" in body.data) || typeof body.data.id !== "string" || !body.data.id) {
        setMessage(uncertainMessage); return;
      }
      if (!active.current) return;
      setName(""); setType("BINARY"); setUnit(""); setFrequency([]);
      setSuccess(true); setMessage("Hábito creado. Consulta Mis hábitos para verificarlo.");
      // Persistence confirmation is independent of the subsequent catalog read.
      const confirmedRequest = controller.current;
      const refreshFailed = () => {
        if (active.current && controller.current === confirmedRequest) {
          setMessage("Hábito creado, pero no se pudo actualizar Mis hábitos. Reintenta la carga, no la creación.");
        }
      };
      try { void Promise.resolve(onCreated?.()).catch(refreshFailed); } catch { refreshFailed(); }
    } catch {
      if (active.current) setMessage(uncertainMessage);
    } finally {
      locked.current = false;
      if (active.current) setPending(false);
    }
  }

  return (
    <section id="crear-habito" className="card min-w-0 scroll-mt-4" aria-labelledby="create-habit-heading">
      <h2 id="create-habit-heading">{editing ? "Editar hábito" : "Crear hábito"}</h2>
      <p className="mt-2 text-hm-caption text-hm-text-mid">{editing ? "Actualiza el nombre, la unidad o los días de la semana." : "Define qué quieres practicar y sus días de la semana."}</p>
      <form aria-label={editing ? "Editar hábito" : "Crear hábito"} onSubmit={submit} noValidate className="mt-6 space-y-4">
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          <legend className="sr-only">Configuración del hábito</legend>
          <div>
            <label htmlFor="habit-name">Nombre</label>
            <input id="habit-name" name="name" ref={nameInput} className={errors.name ? "input-error mt-1" : "input mt-1"} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "habit-name-error" : undefined} />
            {errors.name && <p id="habit-name-error" className="mt-1 text-hm-caption text-hm-danger">{errors.name}</p>}
          </div>
          {editing ? <p className="text-hm-caption text-hm-text-mid">Tipo: {type === "BINARY" ? "Binario" : "Numérico"}</p> : <div>
            <label htmlFor="habit-type">Tipo</label>
            <select id="habit-type" className="input mt-1" value={type} onChange={(event) => { setType(event.target.value as "BINARY" | "NUMERIC"); setUnit(""); setErrors({}); }}>
              <option value="BINARY">Binario (hecho o no hecho)</option>
              <option value="NUMERIC">Numérico (cantidad y unidad)</option>
            </select>
          </div>}
          {type === "NUMERIC" && <div>
            <label htmlFor="habit-unit">Unidad</label>
            <input id="habit-unit" name="unit" className={errors.unit ? "input-error mt-1" : "input mt-1"} value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={30} aria-invalid={!!errors.unit} aria-describedby={errors.unit ? "habit-unit-error" : "habit-unit-hint"} />
            <p id="habit-unit-hint" className="mt-1 text-hm-caption text-hm-text-mid">Por ejemplo: kilómetros, páginas o minutos. Máximo 30 caracteres.</p>
            {errors.unit && <p id="habit-unit-error" className="text-hm-caption text-hm-danger">{errors.unit}</p>}
          </div>}
          <fieldset className="min-w-0" aria-describedby={errors.frequency ? "habit-frequency-error" : undefined} aria-invalid={!!errors.frequency}>
            <legend>Días de la semana</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {weekdayLabels.map((label, day) => <label key={day} className="flex min-h-11 items-center gap-2 rounded-hm-sm border border-hm-border px-2 text-hm-caption text-hm-text">
                <input type="checkbox" name={`weekday-${day}`} checked={frequency.includes(day)} onChange={(event) => setFrequency((days) => event.target.checked ? [...days, day] : days.filter((value) => value !== day))} className="accent-hm-accent focus-visible:ring-2 focus-visible:ring-hm-accent" />
                {label}
              </label>)}
            </div>
            {errors.frequency && <p id="habit-frequency-error" className="mt-1 text-hm-caption text-hm-danger">{errors.frequency}</p>}
          </fieldset>
          <button type="submit" className="btn-primary w-full" disabled={pending}>{editing ? (pending ? "Guardando…" : "Guardar cambios") : (pending ? "Creando…" : "Crear hábito")}</button>
          {editing && <button type="button" className="btn-secondary w-full" onClick={onCancel}>Cancelar edición</button>}
        </fieldset>
        {message && <p role={success ? "status" : "alert"} className={`text-hm-caption ${success ? "text-hm-success" : "text-hm-danger"}`}>{message}</p>}
        {warning && <p role="status" className="rounded-hm-sm bg-hm-warn-soft px-3 py-2 text-hm-caption text-hm-warn">{warning}</p>}
      </form>
    </section>
  );
}
