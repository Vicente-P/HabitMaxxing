import { weekdayOf } from "./calendar-date";

export type CompletionLog = { date: string; completed: boolean };

export type Completion = {
  percentage: number;
  completedDays: number;
  scheduledDaysElapsed: number;
  message: string | null;
};

export const emptyCompletionMessage = "Cumplimiento: 0% — ¡Empieza hoy!";

const dayMs = 86_400_000;

function lastDayOf(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

function nextDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + dayMs).toISOString().slice(0, 10);
}

/**
 * Completion of `month` (`YYYY-MM`, UTC) as of `today`; dates are `YYYY-MM-DD`, `frequency` weekdays with Sunday = 0.
 * Elapsed scheduled days run from the later of the 1st and `createdOn` to the earlier of `today` (included) and the
 * month's last day; non-scheduled days and days before creation never count. A future month has no elapsed days.
 */
export function calculateCompletion(
  logs: readonly CompletionLog[],
  frequency: readonly number[],
  month: string,
  today: string,
  createdOn: string,
): Completion {
  const first = `${month}-01`;
  const start = createdOn > first ? createdOn : first;
  const lastOfMonth = lastDayOf(month);
  const end = today < lastOfMonth ? today : lastOfMonth;
  const completedDates = new Set(logs.filter((log) => log.completed).map((log) => log.date));

  let scheduledDaysElapsed = 0;
  let completedDays = 0;
  for (let date = start; date <= end; date = nextDay(date)) {
    if (!frequency.includes(weekdayOf(date))) continue;
    scheduledDaysElapsed += 1;
    if (completedDates.has(date)) completedDays += 1;
  }

  const percentage = scheduledDaysElapsed === 0 ? 0 : Math.round((completedDays / scheduledDaysElapsed) * 1000) / 10;
  return { percentage, completedDays, scheduledDaysElapsed, message: completedDays === 0 ? emptyCompletionMessage : null };
}
