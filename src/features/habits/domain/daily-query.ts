export type DailyAgendaQueryInput = { date: string | null; day: string | null };

export type DailyAgendaQueryResult =
  | { ok: true; date: string; day: number }
  | { ok: false; field: "date" | "day"; message: string };

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

/**
 * Resolves the date and weekday (0 = Sunday) of the daily agenda.
 * A supplied date determines the weekday even if a conflicting day is also supplied.
 * `today` is the current UTC date (YYYY-MM-DD), injected to keep the function pure.
 */
export function resolveDailyAgendaQuery(input: DailyAgendaQueryInput, today: string): DailyAgendaQueryResult {
  if (input.date !== null && !isValidCalendarDate(input.date)) {
    return { ok: false, field: "date", message: "La fecha debe tener formato YYYY-MM-DD válido" };
  }
  if (input.day !== null && !/^[0-6]$/.test(input.day)) {
    return { ok: false, field: "day", message: "El día debe ser un entero entre 0 y 6" };
  }
  const date = input.date ?? today;
  const day = input.date !== null ? weekdayOf(input.date) : input.day !== null ? Number(input.day) : weekdayOf(today);
  return { ok: true, date, day };
}
