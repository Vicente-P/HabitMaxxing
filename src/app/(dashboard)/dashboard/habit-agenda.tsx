"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { formatFrequency } from "@/features/habits";
import { utcToday } from "@/features/habits/domain/calendar-date";
import { pendingRuntime } from "@/lib/offline-logs/pending-runtime";
import HabitCheck from "./habit-check";
import NumericValueField from "./numeric-value-field";

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
type AgendaState = { status: "loading" | "ready" | "error" | "unauthorized"; habits: DailyHabit[]; hasCatalogHabits: boolean; date: string | null };

async function fetchAgenda(ownerId: string, signal: AbortSignal): Promise<AgendaState> {
  try {
    const [dailyResponse, catalogResponse] = await Promise.all([
      fetch("/api/habits", { cache: "no-store", credentials: "same-origin", redirect: "error", signal }),
      fetch("/api/habits?view=catalog", { cache: "no-store", credentials: "same-origin", redirect: "error", signal }),
    ]);
    if (dailyResponse.status === 401 || catalogResponse.status === 401) return { status: "unauthorized", habits: [], hasCatalogHabits: false, date: null };
    if (dailyResponse.status !== 200 || catalogResponse.status !== 200) return { status: "error", habits: [], hasCatalogHabits: false, date: null };
    const [daily, catalog] = await Promise.all([dailyResponse.json(), catalogResponse.json()]);
    const parsedDaily = dailySchema.safeParse(daily);
    const parsedCatalog = catalogSchema.safeParse(catalog);
    if (!parsedDaily.success || !parsedCatalog.success ||
      parsedDaily.data.data.some((habit) => habit.userId !== ownerId) ||
      parsedCatalog.data.data.some((habit) => habit.userId !== ownerId)) {
      return { status: "error", habits: [], hasCatalogHabits: false, date: null };
    }
    return { status: "ready", habits: parsedDaily.data.data, hasCatalogHabits: parsedCatalog.data.data.length > 0, date: parsedDaily.data.meta.date };
  } catch {
    return { status: "error", habits: [], hasCatalogHabits: false, date: null };
  }
}

const savedLogSchema = z.object({ data: z.object({ id: z.string().min(1), completed: z.boolean(), value: z.number().nullable(), date: z.string() }) });
const unauthorizedMessage = "Tu sesión ya no está disponible. Inicia sesión nuevamente.";
const serverErrorSchema = z.object({ error: z.object({ details: z.array(z.object({ field: z.string(), message: z.string() })).optional() }) });
const toggleErrorMessage = "No se pudo actualizar el hábito. Inténtalo de nuevo.";
const pastAgendaMessage = (date: string) => `Esta agenda es de ${date.split("-").reverse().join("/")}. Conéctate para registrar hoy.`;

export default function HabitAgenda({ ownerId, refreshKey = 0 }: { ownerId: string; refreshKey?: number }) {
  return <AgendaContent key={ownerId} ownerId={ownerId} refreshKey={refreshKey} />;
}

function AgendaContent({ ownerId, refreshKey }: { ownerId: string; refreshKey: number }) {
  const [state, setState] = useState<AgendaState>({ status: "loading", habits: [], hasCatalogHabits: false, date: null });
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const inFlight = useRef(new Set<string>());
  const active = useRef(true);
  const { pending, syncVersion } = useSyncExternalStore(pendingRuntime.subscribe, pendingRuntime.getSnapshot, pendingRuntime.getSnapshot);

  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    void fetchAgenda(ownerId, controller.signal).then((nextState) => {
      if (!controller.signal.aborted) setState(nextState);
    });
    return () => { active.current = false; controller.abort(); };
  }, [ownerId, refreshKey, syncVersion]);

  /** The queued change for this habit on the displayed day, if any (ADR-08 §7: shown at once, server stays the truth). */
  function queuedFor(habit: DailyHabit) {
    return pending.find((log) => log.habitId === habit.id && log.date === state.date);
  }

  function displayedOf(habit: DailyHabit): { completed: boolean; value: number | null } {
    const payload = queuedFor(habit)?.payload;
    if (payload && "completed" in payload) return { completed: payload.completed, value: null };
    if (payload) return { completed: true, value: payload.value };
    return { completed: habit.todayLog?.completed === true, value: habit.todayLog?.value ?? null };
  }

  function toggle(habit: DailyHabit) {
    return save(habit, { completed: !displayedOf(habit).completed });
  }

  async function save(habit: DailyHabit, payload: { completed: boolean } | { value: number }) {
    if (inFlight.current.has(habit.id)) return;
    inFlight.current.add(habit.id);
    setSaving(new Set(inFlight.current));
    setToggleErrors((errors) => ({ ...errors, [habit.id]: "" }));
    let failure = "";
    const date = state.date;
    try {
      let response: Response;
      try {
        response = await fetch(`/api/habits/${encodeURIComponent(habit.id)}/logs`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, ...payload }),
          credentials: "same-origin", cache: "no-store", redirect: "error",
        });
      } catch {
        // No response at all: queue it for today's agenda only (ADR-08 §4, §5).
        if (date !== null && date === utcToday(new Date())) {
          if (!await pendingRuntime.enqueue({ habitId: habit.id, date, payload })) failure = toggleErrorMessage;
        } else {
          failure = date ? pastAgendaMessage(date) : toggleErrorMessage;
        }
        return;
      }
      if (response.status === 401) failure = unauthorizedMessage;
      else if (response.status === 400 && "value" in payload) {
        // Surface the server's own validation message for the value field when it sends one.
        const parsedError = serverErrorSchema.safeParse(await response.json().catch(() => null));
        failure = parsedError.success ? parsedError.data.error.details?.find((detail) => detail.field === "value")?.message ?? toggleErrorMessage : toggleErrorMessage;
      }
      else if (response.status !== 200) failure = toggleErrorMessage;
      else {
        // The server now holds the latest value; an older queued one must never overwrite it later.
        if (date) await pendingRuntime.forget(habit.id, date);
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
            const queued = queuedFor(habit) !== undefined;
            const { completed, value } = displayedOf(habit);
            return <li key={habit.id} className={`flex flex-wrap items-center gap-x-[18px] border-b border-hm-border-lo px-1 py-[18px]${index === 0 ? " border-t" : ""}`}>
              {habit.type === "BINARY" && <HabitCheck checked={completed} label={`Completar ${habit.name}`} disabled={saving.has(habit.id)} onToggle={() => void toggle(habit)} />}
              <div className="min-w-0 flex-1">
                <h3 className={`break-words text-[14px] font-semibold leading-[1.2] text-hm-text-hi md:text-[16px]${completed ? " md:text-hm-text-mid md:line-through md:decoration-hm-text-dim" : ""}`}>{habit.name}</h3>
                <p className="mt-0.5 break-words text-[11px] text-hm-text-low md:mt-1 md:text-[12px]">{formatFrequency(habit.frequency)}</p>
                {queued && <p className="mt-0.5 text-hm-caption text-hm-warn">Pendiente de sincronizar</p>}
              </div>
              {habit.type === "NUMERIC" && <NumericValueField habitName={habit.name} unit={habit.unit} savedValue={value} disabled={saving.has(habit.id)} onSubmit={(value) => void save(habit, { value })} />}
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
