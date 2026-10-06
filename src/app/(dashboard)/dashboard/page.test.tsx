import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { auth, redirect } = vi.hoisted(() => ({ auth: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("next/navigation", () => ({ redirect }));

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
    },
  );

  it("renders the existing placeholder for a server-verified safe user identity", async () => {
    auth.mockResolvedValue({ user: { id: "u1", name: "User", email: "user@example.com" }, expires: "2030-01-01T00:00:00Z" });
    render(await DashboardPage());
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(auth).toHaveBeenCalledOnce();
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByText("user@example.com")).not.toBeInTheDocument();
  });

  it("fails closed when server authentication throws instead of returning protected content", async () => {
    const unavailable = new Error("authentication unavailable");
    auth.mockRejectedValue(unavailable);
    await expect(Promise.resolve().then(() => DashboardPage())).rejects.toBe(unavailable);
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
  });
});
