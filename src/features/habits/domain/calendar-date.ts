/** Pure helpers for calendar dates expressed as `YYYY-MM-DD` strings (interpreted in UTC). */

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Weekday of a valid calendar date, 0 = Sunday. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

/** The UTC calendar date of `now`. */
export function utcToday(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** True when `date` is after `today`; both must be valid `YYYY-MM-DD` strings. */
export function isFutureDate(date: string, today: string): boolean {
  return date > today;
}
