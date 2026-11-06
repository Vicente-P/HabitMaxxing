import { describe, expect, it } from "vitest";
import { isFutureDate, isValidCalendarDate, utcToday, weekdayOf } from "./calendar-date";

describe("calendar-date", () => {
  it.each(["2026-05-20", "2024-02-29"])("accepts the real date %s", (value) => {
    expect(isValidCalendarDate(value)).toBe(true);
  });

  it.each(["2026-02-30", "2026-13-01", "2026-2-03", "2025-02-29", "", "2026-05-20T00:00"])("rejects %s", (value) => {
    expect(isValidCalendarDate(value)).toBe(false);
  });

  it("computes the weekday with 0 as Sunday", () => {
    expect(weekdayOf("2026-05-20")).toBe(3);
    expect(weekdayOf("2026-05-24")).toBe(0);
  });

  it("uses the UTC date even when the local day differs", () => {
    expect(utcToday(new Date("2026-05-20T23:59:59.999Z"))).toBe("2026-05-20");
    expect(utcToday(new Date("2026-05-21T00:00:00.000Z"))).toBe("2026-05-21");
  });

  it("flags only dates after today as future", () => {
    expect(isFutureDate("2026-05-21", "2026-05-20")).toBe(true);
    expect(isFutureDate("2026-05-20", "2026-05-20")).toBe(false);
    expect(isFutureDate("2026-05-19", "2026-05-20")).toBe(false);
  });
});
