import { describe, expect, it } from "vitest";
import { createHabitSchema } from "@/lib/validations";

const binary = { name: " Read ", type: "BINARY", frequency: [6, 0, 3] };

describe("create habit validation", () => {
  it("trims text and sorts weekdays", () => {
    expect(createHabitSchema.parse(binary)).toEqual({ ...binary, name: "Read", frequency: [0, 3, 6] });
    expect(createHabitSchema.parse({ ...binary, type: "NUMERIC", unit: " pages " })).toMatchObject({ unit: "pages" });
  });

  it.each([
    { name: "" }, { name: "   " }, { name: "x".repeat(101) }, { name: 1 },
    { type: "binary" }, { type: "OTHER" }, { type: null },
    { unit: null }, { unit: "pages" }, { unit: undefined },
    { frequency: [] }, { frequency: [0, 0] }, { frequency: [-1] },
    { frequency: [7] }, { frequency: [1.5] }, { frequency: ["1"] },
    { frequency: null }, { frequency: [0, 1, 2, 3, 4, 5, 6, 0] },
    { userId: "other" }, { id: "chosen" }, { createdAt: "now" }, { extra: true },
  ])("rejects invalid binary input %j", (patch) => {
    expect(createHabitSchema.safeParse({ ...binary, ...patch }).success).toBe(false);
  });

  it.each([undefined, null, "", "   ", 1, "x".repeat(31)])("rejects invalid numeric unit %j", (unit) => {
    expect(createHabitSchema.safeParse({ ...binary, type: "NUMERIC", unit }).success).toBe(false);
  });

  it("accepts inclusive length and weekday limits", () => {
    expect(createHabitSchema.safeParse({ name: "x".repeat(100), type: "NUMERIC", unit: "x".repeat(30), frequency: [6, 5, 4, 3, 2, 1, 0] }).success).toBe(true);
  });
});
