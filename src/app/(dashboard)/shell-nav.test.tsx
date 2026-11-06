import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

import { MobileTabBar, SidebarNav } from "./shell-nav";

afterEach(() => { cleanup(); vi.resetAllMocks(); });

const navs = [
  ["sidebar", () => <SidebarNav />, "Navegación principal"],
  ["tab bar", () => <MobileTabBar />, "Navegación móvil"],
] as const;

describe.each(navs)("%s", (_name, view, navName) => {
  it("links Hoy to /dashboard and Hábitos to /habits, and nothing else", () => {
    usePathname.mockReturnValue("/dashboard");
    render(view());
    const nav = screen.getByRole("navigation", { name: navName });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hoy" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Hábitos" })).toHaveAttribute("href", "/habits");
    for (const omitted of [/Estadísticas/, /Calendario/, /Configuración/, /Perfil/, /Stats/, /Nivel/, /XP/]) {
      expect(screen.queryByText(omitted)).not.toBeInTheDocument();
    }
  });

  it.each([
    ["/dashboard", "Hoy", "Hábitos"],
    ["/habits", "Hábitos", "Hoy"],
    ["/habits/abc-123", "Hábitos", "Hoy"],
  ])("on %s only %s is aria-current=page", (path, active, inactive) => {
    usePathname.mockReturnValue(path);
    render(view());
    expect(screen.getByRole("link", { name: active })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: inactive })).not.toHaveAttribute("aria-current");
  });

  it("marks nothing as current on an unrelated path", () => {
    usePathname.mockReturnValue("/habitsx");
    render(view());
    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});

describe("tab bar create button", () => {
  it("is a link named Crear hábito to the create form anchor, between Hoy and Hábitos", () => {
    usePathname.mockReturnValue("/dashboard");
    render(<MobileTabBar />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/dashboard", "/habits#crear-habito", "/habits"]);
    expect(screen.getByRole("link", { name: "Crear hábito" })).toHaveAttribute("href", "/habits#crear-habito");
  });

  it("focuses the Nombre field once it exists", async () => {
    usePathname.mockReturnValue("/habits");
    render(<><MobileTabBar /><label htmlFor="habit-name">Nombre</label><input id="habit-name" /></>);
    await userEvent.click(screen.getByRole("link", { name: "Crear hábito" }));
    await waitFor(() => expect(screen.getByLabelText("Nombre")).toHaveFocus());
  });
});

describe("sidebar", () => {
  it("has no create button (the mockup sidebar has none)", () => {
    usePathname.mockReturnValue("/dashboard");
    render(<SidebarNav />);
    expect(screen.queryByRole("link", { name: "Crear hábito" })).not.toBeInTheDocument();
  });
});
