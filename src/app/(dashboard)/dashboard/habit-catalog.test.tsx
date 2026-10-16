import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HabitCatalog from "./habit-catalog";

const fetchMock = vi.fn();
const habit = { id: "habit", name: "Off-day habit", type: "NUMERIC", unit: "pages", frequency: [0], userId: "owner" };
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

describe("persistent habit catalog", () => {
  it("fetches uncached on mount and remount, retaining off-day records as text", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({ data: [{ ...habit, name: "<script>literal</script>" }] })));
    const view = render(<HabitCatalog ownerId="owner" />);
    expect(await screen.findByText("<script>literal</script>")).toBeInTheDocument();
    expect(screen.getByText("Numérico · pages")).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getByText("Domingo")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/habits?view=catalog");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
    view.unmount(); render(<HabitCatalog ownerId="owner" />);
    await screen.findByText("<script>literal</script>");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("distinguishes loading and empty states", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
    render(<HabitCatalog ownerId="owner" />);
    expect(screen.getByText("Cargando hábitos…")).toBeInTheDocument();
    expect(screen.queryByText("Crea tu primer hábito para comenzar")).not.toBeInTheDocument();
    resolve(Response.json({ data: [] }));
    await screen.findByText("Crea tu primer hábito para comenzar");
  });
  it.each(["network", "500", "malformed", "foreign-owner"])("recovers catalog errors with GET-only retry: %s", async (failure) => {
    if (failure === "network") fetchMock.mockRejectedValueOnce(new Error("private"));
    else if (failure === "500") fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    else if (failure === "malformed") fetchMock.mockResolvedValueOnce(Response.json({ data: {} }));
    else fetchMock.mockResolvedValueOnce(Response.json({ data: [{ ...habit, userId: "foreign" }] }));
    fetchMock.mockResolvedValueOnce(Response.json({ data: [habit] }));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Reintentar carga" }));
    await screen.findByText(habit.name);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.every(([, options]) => !options.method)).toBe(true);
  });
  it("clears stale records on revisit and 401", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: [habit] })).mockResolvedValueOnce(new Response("", { status: 401 }));
    render(<HabitCatalog ownerId="owner" />); await screen.findByText(habit.name);
    window.dispatchEvent(new Event("pageshow"));
    await screen.findByText("Tu sesión ya no está disponible. Inicia sesión nuevamente.");
    expect(screen.queryByText(habit.name)).not.toBeInTheDocument();
  });
  it("cancels previous identity loads and ignores their late responses", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((done) => { resolve = done; })).mockResolvedValueOnce(Response.json({ data: [] }));
    const view = render(<HabitCatalog ownerId="owner" />);
    const signal = fetchMock.mock.calls[0][1].signal;
    view.rerender(<HabitCatalog ownerId="different-owner" />);
    expect(signal.aborted).toBe(true);
    await screen.findByText("Crea tu primer hábito para comenzar");
    resolve(Response.json({ data: [habit] }));
    await waitFor(() => expect(screen.queryByText(habit.name)).not.toBeInTheDocument());
  });
  it.each([true, false])("refreshes after confirmed creation independently of refresh result: %s", async (refreshSucceeds) => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: [] }));
    fetchMock.mockResolvedValueOnce(Response.json({ data: { id: "habit" } }, { status: 201 }));
    fetchMock.mockResolvedValueOnce(refreshSucceeds ? Response.json({ data: [habit] }) : new Response("", { status: 500 }));
    render(<HabitCatalog ownerId="owner" />); await screen.findByText("Crea tu primer hábito para comenzar");
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Read");
    await user.click(screen.getByRole("checkbox", { name: "Lunes" }));
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await screen.findByText("Hábito creado. Consulta Mis hábitos para verificarlo.");
    if (refreshSucceeds) await screen.findByText(habit.name);
    else expect(await screen.findByRole("button", { name: "Reintentar carga" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.filter(([, options]) => options.method === "POST")).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("");
  });
});
