import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, themeInitScript } from "./theme";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.hmTheme;
  vi.restoreAllMocks();
});

const run = () => new Function(themeInitScript)();

describe("themeInitScript", () => {
  it("applies the saved light theme to <html> before first paint", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    run();
    expect(document.documentElement.dataset.hmTheme).toBe("light");
  });

  it("applies the saved dark theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    run();
    expect(document.documentElement.dataset.hmTheme).toBe("dark");
  });

  it.each([[null], ["blue"], [""]])("leaves the default dark theme when the saved value is %j", (saved) => {
    if (saved !== null) localStorage.setItem(THEME_STORAGE_KEY, saved);
    run();
    expect(document.documentElement.dataset.hmTheme).toBeUndefined();
  });

  it("does not throw when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    expect(run).not.toThrow();
    expect(document.documentElement.dataset.hmTheme).toBeUndefined();
  });
});
