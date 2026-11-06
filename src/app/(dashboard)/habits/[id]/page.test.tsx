import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), redirect: vi.fn(), notFound: vi.fn(), findHabit: vi.fn(), findLogs: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { habit: { findUnique: mocks.findHabit }, habitLog: { findMany: mocks.findLogs } } }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));

import HabitDetailPage from "./page";

const row = { id: "h1", name: "Meditar", type: "BINARY", unit: null, frequency: [0, 1, 2, 3, 4, 5, 6], userId: "u1", createdAt: new Date(0), updatedAt: new Date(0) };
const day = (date: string, completed = true) => ({ date: new Date(`${date}T00:00:00.000Z`), completed });
const params = (id = "h1") => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-05-20T10:00:00.000Z"));
  mocks.auth.mockResolvedValue({ user: { id: "u1" } });
  mocks.findHabit.mockResolvedValue(row);
  mocks.findLogs.mockResolvedValue([]);
  mocks.redirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  mocks.notFound.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.resetAllMocks(); });

describe("habit detail page", () => {
  it.each([null, {}, { user: {} }, { user: { id: " " } }])("redirects to /login without a session: %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    await expect(HabitDetailPage(params())).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/login");
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it("renders not-found for a foreign habit and for a missing one", async () => {
    mocks.findHabit.mockResolvedValue({ ...row, userId: "other" });
    await expect(HabitDetailPage(params())).rejects.toThrow("NEXT_NOT_FOUND");
    mocks.findHabit.mockResolvedValue(null);
    await expect(HabitDetailPage(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledTimes(2);
  });

  it("shows the hero, breadcrumb, back link and the plural streak line", async () => {
    mocks.findLogs.mockResolvedValue([day("2026-05-18"), day("2026-05-19"), day("2026-05-20")]);
    render(await HabitDetailPage(params()));
    expect(screen.getByRole("heading", { level: 1, name: "Meditar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver/ })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Hábitos")).toBeInTheDocument();
    expect(screen.getByText("Racha actual: 3 días")).toBeInTheDocument();
    expect(screen.getByText("Binario · Todos los días")).toBeInTheDocument();
    expect(screen.queryByText(/Racha anterior/)).not.toBeInTheDocument();
  });

  it("uses the singular for one day", async () => {
    mocks.findLogs.mockResolvedValue([day("2026-05-20")]);
    render(await HabitDetailPage(params()));
    expect(screen.getByText("Racha actual: 1 día")).toBeInTheDocument();
  });

  it("shows 0 días and the previous streak only when current is 0 and previous > 0", async () => {
    mocks.findLogs.mockResolvedValue([day("2026-05-10"), day("2026-05-11"), day("2026-05-12")]);
    render(await HabitDetailPage(params()));
    expect(screen.getByText("Racha actual: 0 días")).toBeInTheDocument();
    expect(screen.getByText("Racha anterior: 3 días")).toBeInTheDocument();
  });

  it("hides the previous streak when both are 0", async () => {
    render(await HabitDetailPage(params()));
    expect(screen.getByText("Racha actual: 0 días")).toBeInTheDocument();
    expect(screen.queryByText(/Racha anterior/)).not.toBeInTheDocument();
  });

  it("renders the numeric unit in the type text and omits out-of-scope controls", async () => {
    mocks.findHabit.mockResolvedValue({ ...row, type: "NUMERIC", unit: "km", frequency: [1, 2, 3, 4, 5] });
    render(await HabitDetailPage(params()));
    expect(screen.getByText("Numérico · km · L–V")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
