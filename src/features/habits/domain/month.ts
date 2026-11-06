/** Calendar months expressed as `YYYY-MM` strings (UTC). */

export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** The UTC month of `now` as `YYYY-MM`. */
export function currentMonth(now: Date): string {
  return now.toISOString().slice(0, 7);
}
