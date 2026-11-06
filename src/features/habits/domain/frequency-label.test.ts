import { describe, expect, it } from "vitest";
import { formatFrequency } from "./frequency-label";

describe("formatFrequency", () => {
  it.each([
    [[0, 1, 2, 3, 4, 5, 6], "Todos los días"],
    [[1, 2, 3, 4, 5], "L–V"],
    [[5, 3, 1], "L · X · V"],
    [[1, 3, 5, 6], "L · X · V · S"],
    [[0, 6], "S · D"],
    [[2], "M"],
    [[4, 4], "J"],
  ])("formats %j as %s", (days, label) => {
    expect(formatFrequency(days)).toBe(label);
  });
});
