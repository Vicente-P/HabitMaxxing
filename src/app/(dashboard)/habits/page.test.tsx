import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { auth, redirect } = vi.hoisted(() => ({ auth: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("../dashboard/habit-catalog", () => ({ default: ({ ownerId }: { ownerId: string }) => <div data-testid="catalog" data-owner={ownerId}><h2>Crear hábito</h2><h2>Mis hábitos</h2></div> }));

import HabitsPage from "./page";

describe("habits page session boundary", () => {
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  it.each([null, {}, { user: null }, { user: {} }, { user: { id: "" } }, { user: { id: " " } }, { user: { id: 1 } }])(
    "redirects to /login without rendering anything: %j",
    async (session) => {
      auth.mockResolvedValue(session);
      const redirected = new Error("NEXT_REDIRECT");
      redirect.mockImplementation(() => { throw redirected; });
      await expect(Promise.resolve().then(() => HabitsPage())).rejects.toBe(redirected);
      expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
      expect(screen.queryByTestId("catalog")).not.toBeInTheDocument();
    },
  );

  it("renders the Hábitos heading with the create form and Mis hábitos for the verified owner", async () => {
    auth.mockResolvedValue({ user: { id: "u1" }, expires: "2030-01-01T00:00:00Z" });
    render(await HabitsPage());
    expect(screen.getByRole("heading", { level: 1, name: "Hábitos" })).toBeInTheDocument();
    expect(screen.getByTestId("catalog")).toHaveAttribute("data-owner", "u1");
    expect(screen.getByRole("heading", { name: "Crear hábito" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis hábitos" })).toBeInTheDocument();
    expect(screen.queryByText("Agenda de hoy")).not.toBeInTheDocument();
  });

  it("fails closed when authentication throws", async () => {
    const unavailable = new Error("authentication unavailable");
    auth.mockRejectedValue(unavailable);
    await expect(Promise.resolve().then(() => HabitsPage())).rejects.toBe(unavailable);
    expect(redirect).not.toHaveBeenCalled();
  });
});
