import { weekdayOf } from "./calendar-date";

export type MonthDayStatus = "completed" | "missed" | "pending" | "not_scheduled";

/** A saved log as the month view reads it (`date` is YYYY-MM-DD). */
export type MonthDayLog = { id: string; completed: boolean; value: number | null; date: string };

export type MonthDay = {
  date: string;
  dayOfWeek: number;
  scheduled: boolean;
  status: MonthDayStatus;
  log: { id: string; completed: boolean; value: number | null } | null;
};

/** First and last calendar day of a valid `YYYY-MM` month. */
export function monthRange(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

/**
 * Every day of `month` (`YYYY-MM`, UTC) for a habit, in order, as of `today`; dates are `YYYY-MM-DD`, `frequency`
 * weekdays with Sunday = 0. A day is `not_scheduled` when its weekday is not in `frequency` or it precedes `createdOn`;
 * otherwise `completed` with a completed log (a numeric value counts), `missed` when it is before `today` without one,
 * and `pending` for today (not completed yet) and future days. Logs outside the month are ignored.
 */
export function buildMonthDays(
  logs: readonly MonthDayLog[],
  frequency: readonly number[],
  month: string,
  today: string,
  createdOn: string,
): MonthDay[] {
  const { to } = monthRange(month);
  const lastDay = Number(to.slice(8));
  const byDate = new Map(logs.map((log) => [log.date, log]));

  return Array.from({ length: lastDay }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    const dayOfWeek = weekdayOf(date);
    const found = byDate.get(date);
    const log = found ? { id: found.id, completed: found.completed, value: found.value } : null;
    const scheduled = frequency.includes(dayOfWeek) && date >= createdOn;
    const status: MonthDayStatus = !scheduled ? "not_scheduled" : log?.completed ? "completed" : date < today ? "missed" : "pending";
    return { date, dayOfWeek, scheduled, status, log };
  });
}
