import { describe, expect, it } from "vitest";
import { buildMonthDays, type MonthDayLog } from "./month-days";

const all = [0, 1, 2, 3, 4, 5, 6];
const log = (date: string, completed = true, value: number | null = null): MonthDayLog => ({ id: `log-${date}`, completed, value, date });
const build = (logs: MonthDayLog[], frequency: number[], month: string, today: string, createdOn = "2020-01-01") =>
  buildMonthDays(logs, frequency, month, today, createdOn);

describe("buildMonthDays", () => {
  it.each([["2026-02", 28], ["2028-02", 29], ["2026-04", 30], ["2026-05", 31]])("lists every day of %s once, in order (%i days)", (month, count) => {
    const days = build([], all, month, "2099-01-01");
    expect(days).toHaveLength(count);
    expect(days.map((day) => day.date)).toEqual(Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`));
  });

  it("reports the weekday with Sunday = 0", () => {
    const days = build([], all, "2026-05", "2099-01-01");
    expect(days[0]).toMatchObject({ date: "2026-05-01", dayOfWeek: 5 });
    expect(days[2]).toMatchObject({ date: "2026-05-03", dayOfWeek: 0 });
    expect(days[3]).toMatchObject({ date: "2026-05-04", dayOfWeek: 1 });
  });

  it("marks a scheduled day with a completed log as completed and exposes the log", () => {
    const [first] = build([log("2026-05-01")], all, "2026-05", "2026-05-20");
    expect(first).toEqual({ date: "2026-05-01", dayOfWeek: 5, scheduled: true, status: "completed", log: { id: "log-2026-05-01", completed: true, value: null } });
  });

  it("marks a past scheduled day without a log as missed", () => {
    expect(build([], all, "2026-05", "2026-05-20")[2]).toMatchObject({ status: "missed", scheduled: true, log: null });
  });

  it("marks a past scheduled day with a completed:false log as missed and keeps the log", () => {
    const day = build([log("2026-05-03", false)], all, "2026-05", "2026-05-20")[2];
    expect(day).toMatchObject({ status: "missed", log: { id: "log-2026-05-03", completed: false, value: null } });
  });

  it("marks a numeric log as completed with its value", () => {
    const day = build([log("2026-05-04", true, 5)], all, "2026-05", "2026-05-20")[3];
    expect(day).toMatchObject({ status: "completed", log: { completed: true, value: 5 } });
  });

  it("marks today pending until completed, then completed; today with completed:false is pending", () => {
    expect(build([], all, "2026-05", "2026-05-20")[19]).toMatchObject({ date: "2026-05-20", status: "pending", scheduled: true });
    expect(build([log("2026-05-20", false)], all, "2026-05", "2026-05-20")[19]).toMatchObject({ status: "pending" });
    expect(build([log("2026-05-20")], all, "2026-05", "2026-05-20")[19]).toMatchObject({ status: "completed" });
  });

  it("marks future scheduled days pending", () => {
    const days = build([], all, "2026-05", "2026-05-20");
    expect(days.slice(20).every((day) => day.status === "pending" && day.scheduled)).toBe(true);
  });

  it("marks weekdays outside the frequency as not_scheduled and unscheduled", () => {
    const days = build([], [1], "2026-05", "2026-05-31"); // only Mondays: 4, 11, 18, 25
    expect(days.filter((day) => day.scheduled).map((day) => day.date)).toEqual(["2026-05-04", "2026-05-11", "2026-05-18", "2026-05-25"]);
    expect(days[0]).toMatchObject({ status: "not_scheduled", scheduled: false });
  });

  it("marks days before the creation date as not_scheduled, even with a log", () => {
    const days = build([log("2026-05-09")], all, "2026-05", "2026-05-20", "2026-05-10");
    expect(days[8]).toMatchObject({ date: "2026-05-09", status: "not_scheduled", scheduled: false });
    expect(days[9]).toMatchObject({ date: "2026-05-10", status: "missed" });
  });

  it("keeps scheduled false exactly when the status is not_scheduled", () => {
    const days = build([log("2026-05-04")], [1, 3], "2026-05", "2026-05-20", "2026-05-02");
    expect(days.every((day) => day.scheduled === (day.status !== "not_scheduled"))).toBe(true);
  });

  it("ignores logs outside the month", () => {
    const days = build([log("2026-04-30"), log("2026-06-01")], all, "2026-05", "2026-05-20");
    expect(days.every((day) => day.log === null)).toBe(true);
  });

  it("is all pending in a future month and all missed in a past month", () => {
    expect(build([], all, "2026-07", "2026-05-20").every((day) => day.status === "pending")).toBe(true);
    expect(build([], all, "2026-04", "2026-05-20").every((day) => day.status === "missed")).toBe(true);
  });
});
