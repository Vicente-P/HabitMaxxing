import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../app/manifest";
import { PWA_COLORS } from "./pwa";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const token = (name: string) => new RegExp(String.raw`${name}:\s*(#[0-9A-Fa-f]{6})`).exec(css)?.[1]?.toLowerCase();

describe("PWA colors", () => {
  it("mirror the dark theme tokens, the default theme (no drift)", () => {
    expect(PWA_COLORS.background.toLowerCase()).toBe(token("--hm-bg"));
    expect(PWA_COLORS.accent.toLowerCase()).toBe(token("--hm-accent"));
    expect(PWA_COLORS.accentLow.toLowerCase()).toBe(token("--hm-accent-lo"));
    expect(PWA_COLORS.onAccent.toLowerCase()).toBe(token("--hm-on-accent"));
  });
});

describe("web app manifest", () => {
  const m = manifest();

  it("installs as a standalone app that opens on the daily agenda", () => {
    expect(m.name).toBe("HabitMaxxing");
    expect(m.short_name).toBe("HabitMaxxing");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/dashboard");
    expect(m.scope).toBe("/");
    expect(m.lang).toBe("es");
  });

  it("uses the dark theme colors so the splash screen and title bar match the app", () => {
    expect(m.background_color).toBe(PWA_COLORS.background);
    expect(m.theme_color).toBe(PWA_COLORS.background);
  });

  it("declares 192 and 512 icons plus a maskable one", () => {
    const icons = m.icons ?? [];
    const sizes = (purpose: string) => icons.filter((i) => (i.purpose ?? "any") === purpose).map((i) => i.sizes);
    expect(sizes("any")).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(sizes("maskable")).toContain("512x512");
    for (const icon of icons) expect(icon.type).toBe("image/png");
  });
});
