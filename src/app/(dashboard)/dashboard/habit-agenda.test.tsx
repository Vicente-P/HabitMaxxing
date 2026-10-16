import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HabitAgenda from "./habit-agenda";

const fetchMock = vi.fn();
const dailyHabit = { id: "h1", name: "Leer", type: "BINARY", unit: null, frequency: [1], userId: "owner", todayLog: null };
const catalogHabit = { id: "h2", name: "Nadar", type: "BINARY", unit: null, frequency: [2], userId: "owner" };
const dailyResponse = (data: unknown[]) => Response.json({ data, meta: { day: 1, date: "2026-10-12", total: data.length } });
const catalogResponse = (data: unknown[]) => Response.json({ data });

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

describe("current-day habit agenda", () => {
  it("shows today's scheduled habits and distinguishes completed from pending", async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url === "/api/habits?view=catalog"
      ? catalogResponse([catalogHabit])
      : dailyResponse([{ ...dailyHabit, todayLog: { id: "log", completed: true, value: null, date: "2026-10-12" } }, { ...dailyHabit, id: "h2", name: "Escribir" }])));
    render(<HabitAgenda ownerId="owner" />);
    expect(await screen.findByRole("heading", { name: "Agenda de hoy" })).toBeInTheDocument();
    expect(screen.getByText("Leer")).toBeInTheDocument();
    expect(screen.getByText("Completado")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/habits", expect.objectContaining({ cache: "no-store" }));
    expect(screen.queryByRole("button", { name: /completar/i })).not.toBeInTheDocument();
  });

  it("offers the first-habit prompt when the user has no catalog habits", async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([]) : dailyResponse([])));
    render(<HabitAgenda ownerId="owner" />);
    expect(await screen.findByText("Crea tu primer hábito para comenzar")).toBeInTheDocument();
  });

  it("explains when catalog habits exist but none are scheduled today", async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([])));
    render(<HabitAgenda ownerId="owner" />);
    expect(await screen.findByText("No tienes hábitos programados para este día")).toBeInTheDocument();
    expect(screen.queryByText("Crea tu primer hábito para comenzar")).not.toBeInTheDocument();
  });
});
