import { describe, expect, it } from "vitest";
import { resolveDailyAgendaQuery } from "./daily-query";

const today = "2026-05-20";

describe("resolveDailyAgendaQuery", () => {
  it("defaults to today and its weekday", () => {
    expect(resolveDailyAgendaQuery({ date: null, day: null }, today)).toEqual({ ok: true, date: "2026-05-20", day: 3 });
  });

  it("derives the weekday from a supplied date", () => {
    expect(resolveDailyAgendaQuery({ date: "2026-05-17", day: null }, today)).toEqual({ ok: true, date: "2026-05-17", day: 0 });
  });

  it("lets a supplied date win over a conflicting day", () => {
    expect(resolveDailyAgendaQuery({ date: "2026-05-20", day: "1" }, today)).toEqual({ ok: true, date: "2026-05-20", day: 3 });
  });

  it("uses day with today's date when no date is supplied", () => {
    expect(resolveDailyAgendaQuery({ date: null, day: "1" }, today)).toEqual({ ok: true, date: "2026-05-20", day: 1 });
  });

  it.each(["2026-02-30", "2026-13-01", "2026-2-03", "20260520", "", "2026-05-20T00:00:00Z"])("rejects invalid date %j", (date) => {
    expect(resolveDailyAgendaQuery({ date, day: null }, today)).toEqual({
      ok: false,
      field: "date",
      message: "La fecha debe tener formato YYYY-MM-DD válido",
    });
  });

  it.each(["-1", "7", "1.0", "01", "", "a"])("rejects invalid day %j", (day) => {
    expect(resolveDailyAgendaQuery({ date: null, day }, today)).toEqual({
      ok: false,
      field: "day",
      message: "El día debe ser un entero entre 0 y 6",
    });
  });

  it("reports the date error before the day error", () => {
    const result = resolveDailyAgendaQuery({ date: "2026-02-30", day: "9" }, today);
    expect(result).toMatchObject({ ok: false, field: "date" });
  });
});
