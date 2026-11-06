import { describe, expect, it } from "vitest";
import { currentMonth, isValidMonth } from "./month";

describe("month helpers", () => {
  it.each(["2026-05", "2028-02", "1999-12"])("accepts %s", (value) => expect(isValidMonth(value)).toBe(true));
  it.each(["2026-5", "2026-13", "2026-00", "abc", "", "2026-05-01", " 2026-05", "26-05"])("rejects %j", (value) => expect(isValidMonth(value)).toBe(false));
  it("derives the current UTC month", () => expect(currentMonth(new Date("2026-05-31T23:59:59.000Z"))).toBe("2026-05"));
});
