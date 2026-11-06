"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import AuthIcon from "../../(auth)/auth-icons";
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

const sessionMessage = "Tu sesión ya no está disponible. Inicia sesión nuevamente.";
const deleteFailedMessage = "No se pudo eliminar el hábito. Inténtalo de nuevo.";

/** Modal confirmation (CA-02). Escape and Cancelar only close it; nothing is requested until Eliminar. */
function ConfirmDeleteDialog({ habit, pending, onCancel, onConfirm }: {
  habit: CatalogHabit; pending: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);
  return (
    <dialog
      ref={dialog} aria-labelledby="delete-habit-heading"
      className="card m-auto w-[calc(100%-2rem)] max-w-sm text-hm-text backdrop:bg-hm-bg/80"
      onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }}
    >
      <h2 id="delete-habit-heading">¿Estás seguro? Esta acción no se puede deshacer</h2>
      <p className="mt-2 break-words text-hm-caption text-hm-text-mid">Se eliminará «{habit.name}» con todo su historial.</p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn-secondary" disabled={pending} onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn-secondary border-hm-danger text-hm-danger" disabled={pending} onClick={onConfirm}>
          <AuthIcon name="trash" size={13} />Eliminar
        </button>
      </div>
    </dialog>
  );
}

type CatalogProps = { ownerId: string; onHabitsChanged?: () => void };

export default function HabitCatalog({ ownerId, onHabitsChanged }: CatalogProps) {
  // Changing the server identity discards every form and catalog state synchronously.
  return <CatalogContent key={ownerId} ownerId={ownerId} onHabitsChanged={onHabitsChanged} />;
}

function CatalogContent({ ownerId, onHabitsChanged }: CatalogProps) {
  // A snapshot of the habit being edited: the form must not depend on the catalog list, which empties while it reloads.
  const [editing, setEditing] = useState<CatalogHabit | null>(null);
  const [state, setState] = useState<CatalogState>({ status: "loading", habits: [] });
  const [confirming, setConfirming] = useState<CatalogHabit | null>(null);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const deleting = useRef(false);
  const [pendingDelete, setPendingDelete] = useState(false);
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

  function saved() {
    onHabitsChanged?.();
    return reload();
  }

  async function confirmDelete(habit: CatalogHabit) {
    if (deleting.current) return;
    deleting.current = true;
    setPendingDelete(true);
    setDeleteFailed(false);
    try {
      const response = await fetch(`/api/habits/${encodeURIComponent(habit.id)}`, {
        method: "DELETE", credentials: "same-origin", cache: "no-store", redirect: "error",
      });
      setConfirming(null);
      if (response.status === 401) { setEditing(null); invalidateSession(); return; }
      if (response.status === 200 || response.status === 404) {
        setEditing((current) => (current?.id === habit.id ? null : current));
        onHabitsChanged?.();
        await reload();
        return;
      }
      setDeleteFailed(true);
    } catch {
      setConfirming(null);
      setDeleteFailed(true);
    } finally {
      deleting.current = false;
      setPendingDelete(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {state.status !== "unauthorized" && <CreateHabitForm
        key={editing ? `edit-${editing.id}` : "create"}
        onCreated={reload} onUnauthorized={invalidateSession}
        habit={editing ?? undefined} onSaved={saved} onCancel={() => setEditing(null)}
      />}
      <section aria-labelledby="habit-catalog-heading" className="min-w-0">
        <h2 id="habit-catalog-heading">Mis hábitos</h2>
        <p className="mt-2 text-hm-caption text-hm-text-mid">Todos tus hábitos configurados, incluidos los que no corresponden a hoy.</p>
        <div className="mt-6" aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "loading" && <p role="status">Cargando hábitos…</p>}
          {state.status === "unauthorized" && <p role="alert">{sessionMessage}</p>}
          {deleteFailed && state.status !== "unauthorized" && <p role="alert" className="field-error mb-3">{deleteFailedMessage}</p>}
          {state.status === "error" && <div className="card space-y-3">
            <p role="alert">No se pudo cargar Mis hábitos. Si acabas de crear uno, reintenta solamente la carga.</p>
            <button type="button" className="btn-secondary" onClick={() => { void reload(); }}>Reintentar carga</button>
          </div>}
          {state.status === "ready" && (state.habits.length === 0 ? <p className="card">Crea tu primer hábito para comenzar</p> : <ul className="space-y-3">
            {state.habits.map((habit) => <li key={habit.id} className="card min-w-0">
              <h3 className="break-words">{habit.name}</h3>
              <p className="mt-2 break-words text-hm-caption text-hm-text-mid">{habit.type === "BINARY" ? "Binario" : `Numérico · ${habit.unit}`}</p>
              <p className="mt-3 flex flex-wrap gap-2" aria-label="Días programados">{habit.frequency.map((day) => <span className="badge-neutral" key={day}>{weekdayLabels[day]}</span>)}</p>
              <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-2" aria-label={`Editar ${habit.name}`} onClick={() => setEditing(habit)}>
                <AuthIcon name="edit" />Editar
              </button>
              <button type="button" className="btn-secondary ml-2 mt-3 inline-flex items-center gap-2 text-hm-danger" aria-label={`Eliminar ${habit.name}`} onClick={() => { setDeleteFailed(false); setConfirming(habit); }}>
                <AuthIcon name="trash" />Eliminar
              </button>
            </li>)}
          </ul>)}
        </div>
      </section>
      {confirming && <ConfirmDeleteDialog
        key={confirming.id} habit={confirming} pending={pendingDelete}
        onCancel={() => setConfirming(null)} onConfirm={() => { void confirmDelete(confirming); }}
      />}
    </div>
  );
}
