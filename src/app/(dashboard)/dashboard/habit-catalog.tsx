"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import CreateHabitForm, { weekdayLabels } from "./create-habit-form";

const catalogSchema = z.object({ data: z.array(z.object({
  id: z.string().min(1), name: z.string(), type: z.enum(["BINARY", "NUMERIC"]),
  unit: z.string().nullable(), frequency: z.array(z.number().int().min(0).max(6)), userId: z.string(),
})) });
type CatalogHabit = z.infer<typeof catalogSchema>["data"][number];
type CatalogState = { status: "loading" | "ready" | "error" | "unauthorized"; habits: CatalogHabit[] };

async function fetchCatalog(ownerId: string, signal: AbortSignal): Promise<CatalogState> {
  try {
    const response = await fetch("/api/habits?view=catalog", { cache: "no-store", credentials: "same-origin", redirect: "error", signal });
    if (response.status === 401) return { status: "unauthorized", habits: [] };
    if (response.status !== 200) return { status: "error", habits: [] };
    const parsed = catalogSchema.safeParse(await response.json());
    if (!parsed.success || parsed.data.data.some((habit) => habit.userId !== ownerId)) return { status: "error", habits: [] };
    return { status: "ready", habits: parsed.data.data };
  } catch {
    return { status: "error", habits: [] };
  }
}

export default function HabitCatalog({ ownerId }: { ownerId: string }) {
  // Changing the server identity discards every form and catalog state synchronously.
  return <CatalogContent key={ownerId} ownerId={ownerId} />;
}

function CatalogContent({ ownerId }: { ownerId: string }) {
  const [state, setState] = useState<CatalogState>({ status: "loading", habits: [] });
  const request = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    return fetchCatalog(ownerId, controller.signal).then((nextState) => {
      if (!controller.signal.aborted) setState(nextState);
    });
  }, [ownerId]);

  const reload = useCallback(() => {
    setState({ status: "loading", habits: [] });
    return load();
  }, [load]);

  useEffect(() => {
    void load();
    const revisit = () => { void reload(); };
    window.addEventListener("pageshow", revisit);
    return () => { request.current?.abort(); window.removeEventListener("pageshow", revisit); };
  }, [load, reload]);

  function invalidateSession() {
    request.current?.abort();
    setState({ status: "unauthorized", habits: [] });
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {state.status !== "unauthorized" && <CreateHabitForm onCreated={reload} onUnauthorized={invalidateSession} />}
      <section aria-labelledby="habit-catalog-heading" className="min-w-0">
        <h2 id="habit-catalog-heading">Mis hábitos</h2>
        <p className="mt-2 text-body-sm text-light-text-secondary">Todos tus hábitos configurados, incluidos los que no corresponden a hoy.</p>
        <div className="mt-6" aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "loading" && <p role="status">Cargando hábitos…</p>}
          {state.status === "unauthorized" && <p role="alert">Tu sesión ya no está disponible. Inicia sesión nuevamente.</p>}
          {state.status === "error" && <div className="card space-y-3">
            <p role="alert">No se pudo cargar Mis hábitos. Si acabas de crear uno, reintenta solamente la carga.</p>
            <button type="button" className="btn-secondary" onClick={() => { void reload(); }}>Reintentar carga</button>
          </div>}
          {state.status === "ready" && (state.habits.length === 0 ? <p className="card">Crea tu primer hábito para comenzar</p> : <ul className="space-y-3">
            {state.habits.map((habit) => <li key={habit.id} className="card min-w-0">
              <h3 className="break-words">{habit.name}</h3>
              <p className="mt-2 break-words text-body-sm text-light-text-secondary">{habit.type === "BINARY" ? "Binario" : `Numérico · ${habit.unit}`}</p>
              <p className="mt-3 flex flex-wrap gap-2" aria-label="Días programados">{habit.frequency.map((day) => <span className="badge-neutral" key={day}>{weekdayLabels[day]}</span>)}</p>
            </li>)}
          </ul>)}
        </div>
      </section>
    </div>
  );
}
