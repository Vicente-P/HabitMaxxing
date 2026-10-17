"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { formatFrequency } from "@/features/habits";
import HabitCheck from "./habit-check";

const dailySchema = z.object({
  data: z.array(z.object({
    id: z.string().min(1), name: z.string(), type: z.enum(["BINARY", "NUMERIC"]),
    unit: z.string().nullable(), frequency: z.array(z.number().int().min(0).max(6)), userId: z.string(),
    todayLog: z.object({ id: z.string(), completed: z.boolean(), value: z.number().nullable(), date: z.string() }).nullable(),
  })),
  meta: z.object({ day: z.number().int().min(0).max(6), date: z.string(), total: z.number().int().nonnegative() }),
});
const catalogSchema = z.object({ data: z.array(z.object({ id: z.string(), userId: z.string() })) });
type DailyHabit = z.infer<typeof dailySchema>['data'][number];
type AgendaState = { status: "loading" | "ready" | "error" | "unauthorized"; habits: DailyHabit[]; hasCatalogHabits: boolean };

async function fetchAgenda(ownerId: string, signal: AbortSignal): Promise<AgendaState> {
  try {
    const [dailyResponse, catalogResponse] = await Promise.all([
      fetch("/api/habits", { cache: "no-store", credentials: "same-origin", redirect: "error", signal }),
      fetch("/api/habits?view=catalog", { cache: "no-store", credentials: "same-origin", redirect: "error", signal }),
    ]);
    if (dailyResponse.status === 401 || catalogResponse.status === 401) return { status: "unauthorized", habits: [], hasCatalogHabits: false };
    if (dailyResponse.status !== 200 || catalogResponse.status !== 200) return { status: "error", habits: [], hasCatalogHabits: false };
    const [daily, catalog] = await Promise.all([dailyResponse.json(), catalogResponse.json()]);
    const parsedDaily = dailySchema.safeParse(daily);
    const parsedCatalog = catalogSchema.safeParse(catalog);
    if (!parsedDaily.success || !parsedCatalog.success ||
      parsedDaily.data.data.some((habit) => habit.userId !== ownerId) ||
      parsedCatalog.data.data.some((habit) => habit.userId !== ownerId)) {
      return { status: "error", habits: [], hasCatalogHabits: false };
    }
    return { status: "ready", habits: parsedDaily.data.data, hasCatalogHabits: parsedCatalog.data.data.length > 0 };
  } catch {
    return { status: "error", habits: [], hasCatalogHabits: false };
  }
}

const savedLogSchema = z.object({ data: z.object({ id: z.string().min(1), completed: z.boolean(), value: z.number().nullable(), date: z.string() }) });
const unauthorizedMessage = "Tu sesión ya no está disponible. Inicia sesión nuevamente.";
const toggleErrorMessage = "No se pudo actualizar el hábito. Inténtalo de nuevo.";

export default function HabitAgenda({ ownerId }: { ownerId: string }) {
  return <AgendaContent key={ownerId} ownerId={ownerId} />;
}

function AgendaContent({ ownerId }: { ownerId: string }) {
  const [state, setState] = useState<AgendaState>({ status: "loading", habits: [], hasCatalogHabits: false });
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const inFlight = useRef(new Set<string>());
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    void fetchAgenda(ownerId, controller.signal).then((nextState) => {
      if (!controller.signal.aborted) setState(nextState);
    });
    return () => { active.current = false; controller.abort(); };
  }, [ownerId]);

  async function toggle(habit: DailyHabit) {
    if (inFlight.current.has(habit.id)) return;
    inFlight.current.add(habit.id);
    setSaving(new Set(inFlight.current));
    setToggleErrors((errors) => ({ ...errors, [habit.id]: "" }));
    let failure = "";
    try {
      const response = await fetch(`/api/habits/${encodeURIComponent(habit.id)}/logs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: habit.todayLog?.completed !== true }),
        credentials: "same-origin", cache: "no-store", redirect: "error",
      });
      if (response.status === 401) failure = unauthorizedMessage;
      else if (response.status !== 200) failure = toggleErrorMessage;
      else {
        const parsed = savedLogSchema.safeParse(await response.json());
        if (!parsed.success) failure = toggleErrorMessage;
        else if (active.current) {
          const { id, completed, value, date } = parsed.data.data;
          setState((current) => ({ ...current, habits: current.habits.map((item) => item.id === habit.id ? { ...item, todayLog: { id, completed, value, date } } : item) }));
        }
      }
    } catch {
      failure = toggleErrorMessage;
    } finally {
      inFlight.current.delete(habit.id);
      if (active.current) {
        setSaving(new Set(inFlight.current));
        if (failure) setToggleErrors((errors) => ({ ...errors, [habit.id]: failure }));
      }
    }
  }

  return (
    <section aria-labelledby="habit-agenda-heading" className="min-w-0">
      <h2 id="habit-agenda-heading">Agenda de hoy</h2>
      <div className="mt-4" aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && <p role="status">Cargando agenda…</p>}
        {state.status === "unauthorized" && <p role="alert">Tu sesión ya no está disponible. Inicia sesión nuevamente.</p>}
        {state.status === "error" && <p role="alert">No se pudo cargar la agenda de hoy.</p>}
        {state.status === "ready" && state.habits.length > 0 && <ul>
          {state.habits.map((habit, index) => {
            const completed = habit.todayLog?.completed === true;
            return <li key={habit.id} className={`flex flex-wrap items-center gap-x-[18px] border-b border-hm-border-lo px-1 py-[18px]${index === 0 ? " border-t" : ""}`}>
              {habit.type === "BINARY" && <HabitCheck checked={completed} label={`Completar ${habit.name}`} disabled={saving.has(habit.id)} onToggle={() => void toggle(habit)} />}
              <div className="min-w-0 flex-1">
                <h3 className={`break-words text-[16px] font-semibold leading-[1.2] ${completed ? "text-hm-text-mid line-through decoration-hm-text-dim" : "text-hm-text-hi"}`}>{habit.name}</h3>
                <p className="mt-1 break-words text-[12px] text-hm-text-low">{formatFrequency(habit.frequency)}</p>
              </div>
              {toggleErrors[habit.id] && <p role="alert" className="w-full text-hm-caption text-hm-danger">{toggleErrors[habit.id]}</p>}
            </li>;
          })}
        </ul>}
        {state.status === "ready" && state.habits.length === 0 && (state.hasCatalogHabits
          ? <p className="card">No tienes hábitos programados para este día</p>
          : <p className="card">Crea tu primer hábito para comenzar</p>)}
      </div>
    </section>
  );
}
