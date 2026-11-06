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

describe("edit mode from Mis hábitos (HU-07 S6-S8)", () => {
  const binary = { id: "b/1", name: "Leer", type: "BINARY", unit: null, frequency: [1, 3], userId: "owner" };
  const numeric = { id: "n1", name: "Correr", type: "NUMERIC", unit: "km", frequency: [2], userId: "owner" };
  const patchCalls = () => fetchMock.mock.calls.filter(([, options]) => options?.method === "PATCH");
  const serve = (patch: () => Promise<Response>) => {
    let list = [binary, numeric];
    fetchMock.mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") return patch();
      return Promise.resolve(Response.json({ data: list }));
    });
    return (next: typeof list) => { list = next; };
  };

  it("shows an Editar button per card that opens the form prefilled with a read-only type", async () => {
    serve(() => Promise.resolve(Response.json({ data: binary })));
    render(<HabitCatalog ownerId="owner" />);
    const button = await screen.findByRole("button", { name: "Editar Correr" });
    expect(button).toHaveTextContent("Editar");
    expect(button).toHaveClass("btn-secondary");
    expect(screen.getByRole("button", { name: "Editar Leer" })).toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.getByRole("heading", { name: "Editar hábito" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Editar hábito" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Correr");
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
    expect(screen.getByLabelText("Unidad")).toHaveValue("km");
    expect(screen.getByLabelText("Martes")).toBeChecked();
    expect(screen.getByLabelText("Lunes")).not.toBeChecked();
    expect(screen.getByText("Tipo: Numérico")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    expect(patchCalls()).toHaveLength(0);
  });

  it("PATCHes once with the exact body, confirms, reloads the catalog and notifies the dashboard", async () => {
    const setList = serve(() => Promise.resolve(Response.json({ data: { ...binary, name: "Leer más" } })));
    const onHabitsChanged = vi.fn();
    render(<HabitCatalog ownerId="owner" onHabitsChanged={onHabitsChanged} />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    expect(screen.getByText("Tipo: Binario")).toBeInTheDocument();
    expect(screen.queryByLabelText("Unidad")).not.toBeInTheDocument();
    setList([{ ...binary, name: "Leer más" }, numeric]);
    await userEvent.clear(screen.getByLabelText("Nombre"));
    await userEvent.type(screen.getByLabelText("Nombre"), "Leer más");
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByRole("status", { name: "" })).toHaveTextContent("Cambios guardados.");
    expect(patchCalls()).toHaveLength(1);
    const [url, options] = patchCalls()[0];
    expect(url).toBe("/api/habits/b%2F1");
    expect(JSON.parse(options.body)).toEqual({ name: "Leer más", frequency: [1, 3] });
    expect(options).toMatchObject({ method: "PATCH", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "Content-Type": "application/json" } });
    expect(options.signal).toBeInstanceOf(AbortSignal);
    await screen.findByRole("heading", { name: "Leer más" });
    expect(onHabitsChanged).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Editar hábito" })).toBeInTheDocument();
    // The confirmation survives the catalog reload (the form is not remounted).
    expect(screen.getByText("Cambios guardados.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Leer más");
  });

  it("keeps edit mode, confirmation and warning while and after the catalog reloads", async () => {
    let finishReload!: () => void;
    let gets = 0;
    fetchMock.mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        return Promise.resolve(Response.json({ data: binary, warnings: [{ code: "FREQUENCY_DAYS_REMOVED", message: "Los registros de ese día no serán eliminados", removedDays: [3] }] }));
      }
      gets += 1;
      if (gets === 1) return Promise.resolve(Response.json({ data: [binary, numeric] }));
      return new Promise<Response>((done) => { finishReload = () => done(Response.json({ data: [{ ...binary, frequency: [1] }, numeric] })); });
    });
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.click(screen.getByLabelText("Miércoles"));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await screen.findByText("Cargando hábitos…");
    expect(screen.getByRole("heading", { name: "Editar hábito" })).toBeInTheDocument();
    expect(screen.getByText("Cambios guardados.")).toBeInTheDocument();
    expect(screen.getByText("Los registros de ese día no serán eliminados (Miércoles)")).toBeInTheDocument();
    finishReload();
    await waitFor(() => expect(screen.queryByText("Cargando hábitos…")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Editar hábito" })).toBeInTheDocument();
    expect(screen.getByText("Cambios guardados.")).toBeInTheDocument();
    expect(screen.getByText("Los registros de ese día no serán eliminados (Miércoles)")).toBeInTheDocument();
    expect(screen.getByLabelText("Miércoles")).not.toBeChecked();
  });

  it("sends the unit only for numeric habits", async () => {
    serve(() => Promise.resolve(Response.json({ data: numeric })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Correr" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await screen.findByText("Cambios guardados.");
    expect(JSON.parse(patchCalls()[0][1].body)).toEqual({ name: "Correr", unit: "km", frequency: [2] });
  });

  it("shows the removed-days warning with day names after a successful save", async () => {
    serve(() => Promise.resolve(Response.json({ data: binary, warnings: [{ code: "FREQUENCY_DAYS_REMOVED", message: "Los registros de ese día no serán eliminados", removedDays: [2, 4] }] })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByText("Los registros de ese día no serán eliminados (Martes, Jueves)")).toHaveClass("text-hm-warn");
    expect(screen.getByText("Cambios guardados.")).toBeInTheDocument();
  });

  it("shows no warning when the response has none", async () => {
    serve(() => Promise.resolve(Response.json({ data: binary })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await screen.findByText("Cambios guardados.");
    expect(screen.queryByText(/Los registros de ese día/)).not.toBeInTheDocument();
  });

  it.each([
    [404, "Este hábito ya no está disponible. Actualiza Mis hábitos."],
    [400, "No se pudo guardar. Revisa los datos y vuelve a intentarlo."],
    [500, "No pudimos confirmar los cambios. Revisa Mis hábitos y vuelve a intentarlo."],
    [200.5, "No pudimos confirmar los cambios. Revisa Mis hábitos y vuelve a intentarlo."],
  ])("maps PATCH status %s to a message without refreshing", async (status, text) => {
    serve(() => Promise.resolve(status === 200.5 ? Promise.reject(new Error("net")) as never : new Response("{}", { status })));
    const onHabitsChanged = vi.fn();
    render(<HabitCatalog ownerId="owner" onHabitsChanged={onHabitsChanged} />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
    expect(screen.queryByText("Cambios guardados.")).not.toBeInTheDocument();
    expect(patchCalls()).toHaveLength(1);
    expect(onHabitsChanged).not.toHaveBeenCalled();
  });

  it("on 401 shows the session message and invalidates the catalog", async () => {
    serve(() => Promise.resolve(new Response("", { status: 401 })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(screen.queryByRole("form", { name: "Editar hábito" })).not.toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("Tu sesión ya no está disponible. Inicia sesión nuevamente.");
    expect(patchCalls()).toHaveLength(1);
  });

  it("blocks invalid edits on the client without any PATCH", async () => {
    serve(() => Promise.resolve(Response.json({ data: binary })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Correr" }));
    await userEvent.clear(screen.getByLabelText("Nombre"));
    await userEvent.clear(screen.getByLabelText("Unidad"));
    await userEvent.click(screen.getByLabelText("Martes"));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Unidad")).toHaveAttribute("aria-invalid", "true");
    expect(patchCalls()).toHaveLength(0);
    expect(screen.queryByText("Cambios guardados.")).not.toBeInTheDocument();
  });

  it("Cancelar edición returns to Crear hábito, and switching habits remounts fresh state", async () => {
    serve(() => Promise.resolve(Response.json({ data: binary })));
    render(<HabitCatalog ownerId="owner" />);
    await userEvent.click(await screen.findByRole("button", { name: "Editar Leer" }));
    await userEvent.type(screen.getByLabelText("Nombre"), " X");
    await userEvent.click(screen.getByRole("button", { name: "Editar Correr" }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Correr");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar edición" }));
    expect(screen.getByRole("heading", { name: "Crear hábito" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Crear hábito" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(patchCalls()).toHaveLength(0);
  });
});
