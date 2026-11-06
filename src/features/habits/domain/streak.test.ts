import { describe, expect, it } from "vitest";
import { calculateStreak } from "./streak";

const everyDay = [0, 1, 2, 3, 4, 5, 6];
const done = (...dates: string[]) => dates.map((date) => ({ date, completed: true }));
const missed = (...dates: string[]) => dates.map((date) => ({ date, completed: false }));

// 2026-05-20 is a Wednesday.
const today = "2026-05-20";

describe("calculateStreak", () => {
  it("returns zeros without logs", () => {
    expect(calculateStreak([], everyDay, today)).toEqual({ current: 0, previous: 0, isActive: false });
  });

  it("counts today when it is completed", () => {
    expect(calculateStreak(done("2026-05-20"), everyDay, today)).toEqual({ current: 1, previous: 0, isActive: true });
  });

  it("does not break or count when today is still pending (no log)", () => {
    expect(calculateStreak(done("2026-05-18", "2026-05-19"), everyDay, today)).toEqual({ current: 2, previous: 0, isActive: true });
  });

  it("does not break or count when today has completed false", () => {
    const logs = [...done("2026-05-18", "2026-05-19"), ...missed("2026-05-20")];
    expect(calculateStreak(logs, everyDay, today)).toEqual({ current: 2, previous: 0, isActive: true });
  });

  it("counts consecutive scheduled days including today", () => {
    expect(calculateStreak(done("2026-05-18", "2026-05-19", "2026-05-20"), everyDay, today).current).toBe(3);
  });

  it("ignores non-scheduled days between completed days (CA-03)", () => {
    // Mon/Wed/Fri habit: Fri 15, Mon 18, Wed 20 completed; weekend and Tue are not scheduled.
    const logs = done("2026-05-15", "2026-05-18", "2026-05-20");
    expect(calculateStreak(logs, [1, 3, 5], today)).toEqual({ current: 3, previous: 0, isActive: true });
  });

  it("ignores a completed log on a non-scheduled day", () => {
    expect(calculateStreak(done("2026-05-19", "2026-05-20"), [3], today)).toEqual({ current: 1, previous: 0, isActive: true });
  });

  it("resets the current streak to 0 after a missed scheduled day and keeps the broken run as previous (CA-02)", () => {
    // 15..17 done (3), 18 missed (no log), 19 missed, today pending.
    expect(calculateStreak(done("2026-05-15", "2026-05-16", "2026-05-17"), everyDay, today)).toEqual({ current: 0, previous: 3, isActive: false });
  });

  it("treats completed false on a past scheduled day as a miss", () => {
    const logs = [...done("2026-05-16", "2026-05-17"), ...missed("2026-05-18"), ...done("2026-05-19")];
    expect(calculateStreak(logs, everyDay, today)).toEqual({ current: 1, previous: 2, isActive: true });
  });

  it("uses the run before the last miss as previous when the current streak is active", () => {
    const logs = done("2026-05-10", "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-17", "2026-05-18", "2026-05-19", "2026-05-20");
    // 14, 15, 16 missed; older run of 4; and nothing before 10.
    expect(calculateStreak(logs, everyDay, today)).toEqual({ current: 4, previous: 4, isActive: true });
  });

  it("uses only the most recently broken run as previous when current is 0", () => {
    const logs = done("2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-10", "2026-05-11");
    expect(calculateStreak(logs, everyDay, today)).toEqual({ current: 0, previous: 2, isActive: false });
  });

  it("keeps the 12-day run as previous after a miss with nothing since (L2)", () => {
    const days = Array.from({ length: 12 }, (_, i) => `2026-05-${String(i + 1).padStart(2, "0")}`);
    expect(calculateStreak(done(...days), everyDay, "2026-05-14")).toEqual({ current: 0, previous: 12, isActive: false });
  });

  it("supports weekly frequency (Mondays only)", () => {
    // Mondays: 04, 11, 18 completed; 25 would be next. Today is Wednesday 20.
    const logs = done("2026-05-04", "2026-05-11", "2026-05-18");
    expect(calculateStreak(logs, [1], today)).toEqual({ current: 3, previous: 0, isActive: true });
    // Monday 18 missed.
    expect(calculateStreak(done("2026-05-04", "2026-05-11"), [1], today)).toEqual({ current: 0, previous: 2, isActive: false });
  });

  it("handles Sunday as weekday 0", () => {
    // 2026-05-24 is a Sunday.
    const logs = done("2026-05-17", "2026-05-24");
    expect(calculateStreak(logs, [0], "2026-05-24")).toEqual({ current: 2, previous: 0, isActive: true });
  });

  it("returns zeros when the habit has no scheduled days", () => {
    expect(calculateStreak(done("2026-05-20"), [], today)).toEqual({ current: 0, previous: 0, isActive: false });
  });

  it("crosses a month boundary", () => {
    const logs = done("2026-04-29", "2026-04-30", "2026-05-01", "2026-05-02");
    expect(calculateStreak(logs, everyDay, "2026-05-02").current).toBe(4);
  });

  it("crosses a year boundary and a leap day", () => {
    expect(calculateStreak(done("2025-12-30", "2025-12-31", "2026-01-01"), everyDay, "2026-01-01").current).toBe(3);
    expect(calculateStreak(done("2028-02-28", "2028-02-29", "2028-03-01"), everyDay, "2028-03-01").current).toBe(3);
  });

  it("does not let days before the first log extend or break anything", () => {
    expect(calculateStreak(done("2026-05-19", "2026-05-20"), everyDay, today)).toEqual({ current: 2, previous: 0, isActive: true });
  });

  it("ignores logs dated after today", () => {
    expect(calculateStreak(done("2026-05-21", "2026-05-22"), everyDay, today)).toEqual({ current: 0, previous: 0, isActive: false });
  });
});
