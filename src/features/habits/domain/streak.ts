import { weekdayOf } from "./calendar-date";

export type StreakLog = { date: string; completed: boolean };

export type Streak = { current: number; previous: number; isActive: boolean };

const dayMs = 86_400_000;

function previousDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) - dayMs).toISOString().slice(0, 10);
}

/**
 * Streak of a habit as of `today` (all dates `YYYY-MM-DD`, UTC; `frequency` weekdays with Sunday = 0).
 * Scheduled days are walked backwards from today. Today completed counts; today not completed yet neither
 * counts nor breaks, because the day is not over. Non-scheduled days are ignored. The first earlier scheduled
 * day without a completed log ends the current run. Days before the first log cannot extend a streak.
 * `previous` is the run broken most recently before the current position: with `current > 0` the run before
 * the miss that precedes the current run, with `current === 0` the run that the latest miss just ended.
 */
export function calculateStreak(logs: readonly StreakLog[], frequency: readonly number[], today: string): Streak {
  const known = logs.filter((log) => log.date <= today);
  if (known.length === 0 || frequency.length === 0) return { current: 0, previous: 0, isActive: false };

  const firstLog = known.reduce((first, log) => (log.date < first ? log.date : first), today);
  const completed = new Set(known.filter((log) => log.completed).map((log) => log.date));

  // Completed runs from the most recent backwards; a miss closes the run in progress.
  const runs: number[] = [];
  let run = 0;
  for (let date = today; date >= firstLog; date = previousDay(date)) {
    if (!frequency.includes(weekdayOf(date))) continue;
    if (completed.has(date)) { run += 1; continue; }
    if (date === today) continue;
    runs.push(run);
    run = 0;
  }
  runs.push(run);

  // runs[0] is the run touching today (0 when the latest scheduled day was missed).
  const current = runs[0];
  const previous = runs.slice(1).find((length) => length > 0) ?? 0;
  return { current, previous, isActive: current > 0 };
}
