import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("./dashboard/logout-button", () => ({ default: () => <button type="button">Cerrar sesión</button> }));

vi.mock("./offline-sync", () => ({ default: ({ ownerId }: { ownerId: string }) => <div data-testid="offline-sync" data-owner={ownerId} /> }));

import DashboardLayout from "./layout";

afterEach(() => { cleanup(); vi.resetAllMocks(); });

const session = (user: object) => ({ user: { id: "u1", ...user }, expires: "2030-01-01T00:00:00Z" });

describe("dashboard shell layout", () => {
  it("renders the sidebar and the tab bar around the page", async () => {
    auth.mockResolvedValue(session({ name: "Mateo Reyes", email: "mateo@example.com" }));
    render(await DashboardLayout({ children: <p>page content</p> }));
    expect(screen.getByText("page content")).toBeInTheDocument();
    const sidebar = screen.getByRole("navigation", { name: "Navegación principal" });
    expect(within(sidebar).getByRole("link", { name: "Hoy" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("NAVEGAR")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegación móvil" })).toBeInTheDocument();
    expect(screen.getAllByText("Maxxing").length).toBeGreaterThan(0);
  });

  it("shows the user block with initials and name, with a Cerrar sesión in the sidebar and in the mobile header", async () => {
    auth.mockResolvedValue(session({ name: "Mateo Reyes", email: "mateo@example.com" }));
    render(await DashboardLayout({ children: null }));
    const aside = screen.getByRole("complementary");
    expect(within(aside).getByText("MR")).toBeInTheDocument();
    expect(within(aside).getByText("Mateo Reyes")).toBeInTheDocument();
    expect(within(aside).getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });

  it("falls back to the email when there is no name", async () => {
    auth.mockResolvedValue(session({ name: null, email: "ana.lopez@example.com" }));
    render(await DashboardLayout({ children: null }));
    const aside = screen.getByRole("complementary");
    expect(within(aside).getByText("ana.lopez@example.com")).toBeInTheDocument();
    expect(within(aside).getByText("A")).toBeInTheDocument();
  });

  it.each([null, {}, { user: null }])("renders only the page, without the shell, when there is no session: %j", async (value) => {
    auth.mockResolvedValue(value);
    render(await DashboardLayout({ children: <p>page content</p> }));
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
  });

  it("mounts the offline sync for the session user", async () => {
    auth.mockResolvedValue(session({ id: "user-42", name: "Mateo Reyes" }));
    render(await DashboardLayout({ children: null }));
    expect(screen.getByTestId("offline-sync")).toHaveAttribute("data-owner", "user-42");
  });

  it.each([undefined, "", "   ", 7])("mounts no offline sync when the session user id is %j", async (id) => {
    auth.mockResolvedValue({ user: { id, name: "Mateo Reyes" }, expires: "2030-01-01T00:00:00Z" });
    render(await DashboardLayout({ children: <p>page content</p> }));
    expect(screen.queryByTestId("offline-sync")).not.toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("mounts no offline sync without a session", async () => {
    auth.mockResolvedValue(null);
    render(await DashboardLayout({ children: null }));
    expect(screen.queryByTestId("offline-sync")).not.toBeInTheDocument();
  });
});
