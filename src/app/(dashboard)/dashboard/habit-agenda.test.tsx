import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Completar Escribir" })).toHaveAttribute("aria-pressed", "false");
    expect(fetchMock).toHaveBeenCalledWith("/api/habits", expect.objectContaining({ cache: "no-store" }));
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

describe("completed card presentation (mockup)", () => {
  it("shows no textual status badge and strikes through only completed titles", async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url === "/api/habits?view=catalog"
      ? catalogResponse([catalogHabit])
      : dailyResponse([{ ...dailyHabit, todayLog: { id: "log", completed: true, value: null, date: "2026-10-12" } }, { ...dailyHabit, id: "h2", name: "Escribir" }])));
    render(<HabitAgenda ownerId="owner" />);
    const done = await screen.findByRole("heading", { name: "Leer" });
    expect(screen.queryByText("Completado")).not.toBeInTheDocument();
    expect(screen.queryByText("Pendiente")).not.toBeInTheDocument();
    expect(done).toHaveClass("md:line-through", "md:text-hm-text-mid", "md:decoration-hm-text-dim");
    expect(done).not.toHaveClass("line-through");
    expect(screen.getByRole("heading", { name: "Escribir" })).not.toHaveClass("md:line-through");
  });
});

describe("mockup row structure", () => {
  it("renders bordered rows instead of cards with the mockup frequency subtitle", async () => {
    fetchMock.mockImplementation((url: string) => Promise.resolve(url === "/api/habits?view=catalog"
      ? catalogResponse([catalogHabit])
      : dailyResponse([
        { ...dailyHabit, frequency: [0, 1, 2, 3, 4, 5, 6] },
        { ...dailyHabit, id: "h2", name: "Escribir", frequency: [1, 2, 3, 4, 5] },
        { ...dailyHabit, id: "h3", name: "Correr", type: "NUMERIC", unit: "km", frequency: [5, 3, 1] },
      ])));
    const { container } = render(<HabitAgenda ownerId="owner" />);
    await screen.findByRole("heading", { name: "Leer" });
    const rows = screen.getAllByRole("listitem");
    expect(container.querySelector(".card")).toBeNull();
    expect(rows).toHaveLength(3);
    rows.forEach((row) => expect(row).toHaveClass("border-b", "border-hm-border-lo"));
    expect(rows[0]).toHaveClass("border-t");
    expect(rows[1]).not.toHaveClass("border-t");
    rows.forEach((row) => {
      expect(row.querySelector("h3")).toHaveClass("text-[14px]", "md:text-[16px]", "font-semibold", "leading-[1.2]", "text-hm-text-hi");
      expect(row.querySelector("p")).toHaveClass("text-[11px]", "md:text-[12px]", "mt-0.5", "md:mt-1", "text-hm-text-low");
    });
    expect(rows.map((row) => row.querySelector("p")?.textContent)).toEqual(["Todos los días", "L–V", "L · X · V"]);
  });
});

describe("binary completion toggle", () => {
  const savedLog = (completed: boolean) => ({ data: { id: "log", habitId: "h1", date: "2026-10-12", completed, value: null, createdAt: "2026-10-12T10:00:00.000Z" } });

  function mockAgenda(todayLog: unknown = null, habit: Record<string, unknown> = {}) {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/habits/h1/logs") return Promise.resolve(Response.json(savedLog(JSON.parse(String(init?.body)).completed)));
      return Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([{ ...dailyHabit, todayLog, ...habit }]));
    });
  }
  const logCalls = () => fetchMock.mock.calls.filter(([url]) => url === "/api/habits/h1/logs");

  it("completes a pending habit and saves it with the same-origin log request", async () => {
    mockAgenda();
    render(<HabitAgenda ownerId="owner" />);
    const button = await screen.findByRole("button", { name: "Completar Leer" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);

    await waitFor(() => expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "true");
    expect(logCalls()).toHaveLength(1);
    expect(logCalls()[0][1]).toMatchObject({ method: "POST", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json" } });
    expect(JSON.parse(String(logCalls()[0][1].body))).toEqual({ completed: true });
  });

  it("reverts a completed habit back to pending", async () => {
    mockAgenda({ id: "log", completed: true, value: null, date: "2026-10-12" });
    render(<HabitAgenda ownerId="owner" />);
    const button = await screen.findByRole("button", { name: "Completar Leer" });
    expect(button).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(button);

    await waitFor(() => expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false"));
    expect(JSON.parse(String(logCalls()[0][1].body))).toEqual({ completed: false });
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
  });

  it("flips back to completed on a second press after a revert", async () => {
    mockAgenda({ id: "log", completed: true, value: null, date: "2026-10-12" });
    render(<HabitAgenda ownerId="owner" />);
    const button = await screen.findByRole("button", { name: "Completar Leer" });
    await userEvent.click(button);
    await waitFor(() => expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false"));
    await userEvent.click(screen.getByRole("button", { name: "Completar Leer" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "true"));
    expect(logCalls().map(([, init]) => JSON.parse(String(init.body)).completed)).toEqual([false, true]);
  });

  it("treats a log saved with completed false as pending", async () => {
    mockAgenda({ id: "log", completed: false, value: null, date: "2026-10-12" });
    render(<HabitAgenda ownerId="owner" />);
    expect(await screen.findByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
  });

  it("disables the control while the request is in flight and ignores extra presses", async () => {
    let resolveSave: (response: Response) => void = () => undefined;
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/habits/h1/logs") return new Promise<Response>((resolve) => { resolveSave = resolve; });
      return Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([dailyHabit]));
    });
    render(<HabitAgenda ownerId="owner" />);
    const button = await screen.findByRole("button", { name: "Completar Leer" });

    await userEvent.click(button);
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(logCalls()).toHaveLength(1);

    resolveSave(Response.json(savedLog(true)));
    await waitFor(() => expect(screen.getByRole("button", { name: "Completar Leer" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "true");
  });

  it.each([
    ["server error", () => Promise.resolve(Response.json({ error: { code: "INTERNAL_ERROR" } }, { status: 500 }))],
    ["network failure", () => Promise.reject(new Error("offline"))],
    ["malformed success body", () => Promise.resolve(Response.json({ data: { completed: "yes" } }))],
  ])("keeps the previous state and shows an error after a %s", async (_name, failure) => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/habits/h1/logs") return failure();
      return Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([dailyHabit]));
    });
    render(<HabitAgenda ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Completar Leer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo actualizar el hábito. Inténtalo de nuevo.");
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Completar Leer" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
  });

  it("asks to sign in again when the save is unauthorized", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/habits/h1/logs") return Promise.resolve(Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 }));
      return Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([dailyHabit]));
    });
    render(<HabitAgenda ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Completar Leer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tu sesión ya no está disponible. Inicia sesión nuevamente.");
    expect(screen.getByRole("button", { name: "Completar Leer" })).toHaveAttribute("aria-pressed", "false");
  });

  it("offers no completion toggle for numeric habits", async () => {
    mockAgenda(null, { type: "NUMERIC", unit: "páginas" });
    render(<HabitAgenda ownerId="owner" />);
    expect(await screen.findByText("L")).toBeInTheDocument();
    expect(screen.queryByText(/Numérico/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Completar/ })).not.toBeInTheDocument();
  });
});

describe("numeric value registration", () => {
  const numericHabit = { ...dailyHabit, name: "Correr", type: "NUMERIC", unit: "km" };
  const savedValue = (value: number) => ({ data: { id: "log", habitId: "h1", date: "2026-10-12", completed: true, value, createdAt: "2026-10-12T10:00:00.000Z" } });
  const logCalls = () => fetchMock.mock.calls.filter(([url]) => url === "/api/habits/h1/logs");

  function mockAgenda(todayLog: unknown = null, save?: (body: { value: number }) => Promise<Response>) {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === "/api/habits/h1/logs") {
        const body = JSON.parse(String(init?.body));
        return save ? save(body) : Promise.resolve(Response.json(savedValue(body.value)));
      }
      return Promise.resolve(url === "/api/habits?view=catalog" ? catalogResponse([catalogHabit]) : dailyResponse([{ ...numericHabit, todayLog }]));
    });
  }

  it("renders a number input with the unit and a confirm button instead of the check", async () => {
    mockAgenda();
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("step", "any");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(screen.getByText("km")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar Correr" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Completar Correr" })).not.toBeInTheDocument();
  });

  it("posts only the value, then shows it with the unit", async () => {
    mockAgenda();
    render(<HabitAgenda ownerId="owner" />);
    await userEvent.type(await screen.findByLabelText("Valor de Correr"), "5");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));

    expect(await screen.findByText("5 km")).toBeInTheDocument();
    expect(logCalls()).toHaveLength(1);
    expect(logCalls()[0][1]).toMatchObject({ method: "POST", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json" } });
    expect(JSON.parse(String(logCalls()[0][1].body))).toEqual({ value: 5 });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("prefills today's value and shows it with the unit, and a new value replaces it", async () => {
    mockAgenda({ id: "log", completed: true, value: 5, date: "2026-10-12" });
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    expect(input).toHaveValue(5);
    expect(screen.getByText("5 km")).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "8.5");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));

    expect(await screen.findByText("8.5 km")).toBeInTheDocument();
    expect(screen.queryByText("5 km")).not.toBeInTheDocument();
    expect(JSON.parse(String(logCalls()[0][1].body))).toEqual({ value: 8.5 });
  });

  it.each([["0"], ["-3"], ["-0.5"], [""]])("shows 'El valor debe ser mayor a 0' for %j without posting", async (typed) => {
    mockAgenda();
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    if (typed) await userEvent.type(input, typed);
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El valor debe ser mayor a 0");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(logCalls()).toHaveLength(0);
  });

  it("clears the validation error after a valid value is saved", async () => {
    mockAgenda();
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    await userEvent.type(input, "0");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));
    await screen.findByRole("alert");
    await userEvent.clear(input);
    await userEvent.type(input, "3");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));
    expect(await screen.findByText("3 km")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the server validation message from a 400 response", async () => {
    mockAgenda(null, () => Promise.resolve(Response.json({
      error: { code: "VALIDATION_ERROR", message: "Datos de entrada inválidos", details: [{ field: "value", message: "El valor debe ser mayor a 0" }] },
    }, { status: 400 })));
    render(<HabitAgenda ownerId="owner" />);
    await userEvent.type(await screen.findByLabelText("Valor de Correr"), "5");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El valor debe ser mayor a 0");
  });

  it("disables the input and button while in flight and ignores extra submissions", async () => {
    let resolveSave: (response: Response) => void = () => undefined;
    mockAgenda(null, () => new Promise<Response>((resolve) => { resolveSave = resolve; }));
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    await userEvent.type(input, "5");
    const button = screen.getByRole("button", { name: "Registrar Correr" });

    await userEvent.click(button);
    expect(button).toBeDisabled();
    expect(input).toBeDisabled();
    await userEvent.click(button);
    expect(logCalls()).toHaveLength(1);

    resolveSave(Response.json(savedValue(5)));
    await waitFor(() => expect(screen.getByRole("button", { name: "Registrar Correr" })).toBeEnabled());
    expect(screen.getByText("5 km")).toBeInTheDocument();
  });

  it.each([
    ["server error", () => Promise.resolve(Response.json({ error: { code: "INTERNAL_ERROR" } }, { status: 500 })), "No se pudo actualizar el hábito. Inténtalo de nuevo."],
    ["network failure", () => Promise.reject(new Error("offline")), "No se pudo actualizar el hábito. Inténtalo de nuevo."],
    ["unauthorized", () => Promise.resolve(Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 })), "Tu sesión ya no está disponible. Inicia sesión nuevamente."],
  ])("keeps the previous value and shows an error after a %s", async (_name, failure, message) => {
    mockAgenda({ id: "log", completed: true, value: 5, date: "2026-10-12" }, failure);
    render(<HabitAgenda ownerId="owner" />);
    const input = await screen.findByLabelText("Valor de Correr");
    await userEvent.clear(input);
    await userEvent.type(input, "9");
    await userEvent.click(screen.getByRole("button", { name: "Registrar Correr" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByText("5 km")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar Correr" })).toBeEnabled();
  });
});
