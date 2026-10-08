import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { auth, redirect } = vi.hoisted(() => ({ auth: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./logout-button", () => ({ default: () => <button type="button">Cerrar sesión</button> }));
vi.mock("./habit-catalog", () => ({ default: ({ ownerId }: { ownerId: string }) => <section data-testid="catalog" data-owner={ownerId}>Mis hábitos</section> }));

import DashboardPage from "./page";

describe("dashboard server session boundary", () => {
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  it.each([null, {}, { user: null }, { user: {} }, { user: { id: "" } }, { user: { id: " " } }, { user: { id: 1 } }])(
    "redirects an unauthenticated or identity-less session without rendering dashboard: %j",
    async (session) => {
      auth.mockResolvedValue(session);
      const redirected = new Error("NEXT_REDIRECT");
      redirect.mockImplementation(() => { throw redirected; });
      await expect(Promise.resolve().then(() => DashboardPage())).rejects.toBe(redirected);
      expect(auth).toHaveBeenCalledOnce();
      expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
      expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
    },
  );

  it("renders the catalog for a server-verified safe user identity", async () => {
    auth.mockResolvedValue({ user: { id: "u1", name: "User", email: "user@example.com" }, expires: "2030-01-01T00:00:00Z" });
    render(await DashboardPage());
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(auth).toHaveBeenCalledOnce();
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByText("user@example.com")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.getByTestId("catalog")).toHaveAttribute("data-owner", "u1");
  });

  it("fails closed when server authentication throws instead of returning protected content", async () => {
    const unavailable = new Error("authentication unavailable");
    auth.mockRejectedValue(unavailable);
    await expect(Promise.resolve().then(() => DashboardPage())).rejects.toBe(unavailable);
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
  });
});
