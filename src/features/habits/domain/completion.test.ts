import { describe, expect, it } from "vitest";
import { calculateCompletion } from "./completion";

const everyDay = [0, 1, 2, 3, 4, 5, 6];
const done = (date: string, completed = true) => ({ date, completed });
const emptyMessage = "Cumplimiento: 0% — ¡Empieza hoy!";

describe("calculateCompletion", () => {
  it("rounds 6 of 7 elapsed scheduled days to 85.7 with no message (S1)", () => {
    const logs = ["01", "02", "03", "04", "05", "06"].map((d) => done(`2026-05-${d}`));
    expect(calculateCompletion(logs, everyDay, "2026-05", "2026-05-07", "2026-01-01")).toEqual({
      percentage: 85.7, completedDays: 6, scheduledDaysElapsed: 7, message: null,
    });
  });

  it("counts only scheduled days and ignores a completed log on a non-scheduled day (S1)", () => {
    // 2026-05-04 Monday .. 2026-05-10 Sunday; Mon/Wed/Fri scheduled; Tuesday log must not count.
    const logs = [done("2026-05-04"), done("2026-05-05"), done("2026-05-06")];
    expect(calculateCompletion(logs, [1, 3, 5], "2026-05", "2026-05-10", "2026-05-04")).toEqual({
      percentage: 66.7, completedDays: 2, scheduledDaysElapsed: 3, message: null,
    });
  });

  it("includes today in the denominator, so a pending today lowers the percentage (S1)", () => {
    const logs = [done("2026-05-01"), done("2026-05-02")];
    expect(calculateCompletion(logs, everyDay, "2026-05", "2026-05-03", "2026-01-01")).toMatchObject({
      percentage: 66.7, completedDays: 2, scheduledDaysElapsed: 3,
    });
  });

  it("counts a completed:false log as not completed (S1)", () => {
    const logs = [done("2026-05-01"), done("2026-05-02", false)];
    expect(calculateCompletion(logs, everyDay, "2026-05", "2026-05-02", "2026-01-01")).toMatchObject({
      percentage: 50, completedDays: 1, scheduledDaysElapsed: 2,
    });
  });

  it("excludes days before the creation date for a habit created mid-month (S1)", () => {
    const logs = [done("2026-05-10"), done("2026-05-11")];
    expect(calculateCompletion(logs, everyDay, "2026-05", "2026-05-12", "2026-05-10")).toMatchObject({
      percentage: 66.7, completedDays: 2, scheduledDaysElapsed: 3,
    });
  });

  it("ignores logs outside the requested month", () => {
    const logs = [done("2026-04-30"), done("2026-06-01"), done("2026-05-01")];
    expect(calculateCompletion(logs, everyDay, "2026-05", "2026-05-02", "2026-01-01")).toMatchObject({
      completedDays: 1, scheduledDaysElapsed: 2,
    });
  });

  it("returns 0 elapsed days with the message for a future month (S1, S2)", () => {
    expect(calculateCompletion([], everyDay, "2026-06", "2026-05-20", "2026-01-01")).toEqual({
      percentage: 0, completedDays: 0, scheduledDaysElapsed: 0, message: emptyMessage,
    });
  });

  it("returns 0 elapsed days when the habit was created after the month ended", () => {
    expect(calculateCompletion([], everyDay, "2026-04", "2026-05-20", "2026-05-02")).toMatchObject({
      percentage: 0, scheduledDaysElapsed: 0, message: emptyMessage,
    });
  });

  it("uses every scheduled day of a past month from creation (S1)", () => {
    const logs = Array.from({ length: 15 }, (_, i) => done(`2026-04-${String(i + 1).padStart(2, "0")}`));
    expect(calculateCompletion(logs, everyDay, "2026-04", "2026-05-20", "2026-01-01")).toMatchObject({
      percentage: 50, completedDays: 15, scheduledDaysElapsed: 30,
    });
  });

  it.each([
    ["2026-02", 28], ["2028-02", 29], ["2026-04", 30], ["2026-01", 31],
  ])("covers the whole month boundary of %s (%i days)", (month, length) => {
    expect(calculateCompletion([], everyDay, month, "2030-01-01", "2020-01-01").scheduledDaysElapsed).toBe(length);
  });

  it("counts only scheduled weekdays across a full month", () => {
    // May 2026 has 5 Fridays (1, 8, 15, 22, 29).
    expect(calculateCompletion([], [5], "2026-05", "2026-06-15", "2026-01-01").scheduledDaysElapsed).toBe(5);
  });

  it("returns 0% with the message when nothing is completed but days elapsed (S2)", () => {
    expect(calculateCompletion([], everyDay, "2026-05", "2026-05-03", "2026-01-01")).toEqual({
      percentage: 0, completedDays: 0, scheduledDaysElapsed: 3, message: emptyMessage,
    });
  });

  it("returns 0% with the message when no scheduled day has elapsed in the month (S1, S2)", () => {
    // Only Mondays; the month starts on Friday and today is Sunday 3rd.
    expect(calculateCompletion([], [1], "2026-05", "2026-05-03", "2026-01-01")).toEqual({
      percentage: 0, completedDays: 0, scheduledDaysElapsed: 0, message: emptyMessage,
    });
  });
});
