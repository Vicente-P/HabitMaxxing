import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import ThemeToggle from "./theme-toggle";

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.hmTheme;
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("starts in dark and offers the light theme", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Cambiar a modo claro" })).toBeInTheDocument();
  });

  it("switches to light, applies it to <html> and saves the preference (CA-01)", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));
    expect(document.documentElement.dataset.hmTheme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
  });

  it("switches back to dark and saves it", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));
    await userEvent.click(screen.getByRole("button", { name: "Cambiar a modo oscuro" }));
    expect(document.documentElement.dataset.hmTheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("reflects a theme the init script already applied (CA-02)", () => {
    document.documentElement.dataset.hmTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
  });

  it("still switches the theme when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));
    expect(document.documentElement.dataset.hmTheme).toBe("light");
  });
});
