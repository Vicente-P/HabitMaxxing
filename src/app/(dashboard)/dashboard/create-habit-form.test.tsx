import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateHabitForm from "./create-habit-form";

const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });
async function fill() {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "Nombre" }), " Read ");
  await user.click(screen.getByRole("checkbox", { name: "Lunes" }));
  return user;
}

describe("create habit form", () => {
  it("enforces name and unit maximums even when native limits are bypassed", async () => {
    render(<CreateHabitForm onCreated={vi.fn()} />);
    const user = await fill();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("maxlength", "100");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "x".repeat(101) } });
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(screen.getByText("El nombre no puede superar 100 caracteres")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Read" } });
    await user.selectOptions(screen.getByLabelText("Tipo"), "NUMERIC");
    fireEvent.change(screen.getByLabelText("Unidad"), { target: { value: "x".repeat(31) } });
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(screen.getByText("La unidad no puede superar 30 caracteres")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("validates accessible name and frequency errors and focuses first field", async () => {
    render(<CreateHabitForm onCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("El nombre del hábito es obligatorio")).toHaveAttribute("id", "habit-name-error");
    expect(screen.getByText("Debes seleccionar al menos un día")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("focuses the weekday control when only frequency is invalid", async () => {
    render(<CreateHabitForm onCreated={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nombre" }), "Read");
    await userEvent.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(screen.getByRole("checkbox", { name: "Domingo" })).toHaveFocus();
  });
  it("requires numeric unit and clears it when switching to binary", async () => {
    render(<CreateHabitForm onCreated={vi.fn()} />);
    const user = await fill();
    await user.selectOptions(screen.getByLabelText("Tipo"), "NUMERIC");
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(screen.getByLabelText("Unidad")).toHaveFocus();
    await user.type(screen.getByLabelText("Unidad"), "pages");
    expect(screen.getByLabelText("Unidad")).toHaveAttribute("maxlength", "30");
    await user.selectOptions(screen.getByLabelText("Tipo"), "BINARY");
    expect(screen.queryByLabelText("Unidad")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Tipo"), "NUMERIC");
    expect(screen.getByLabelText("Unidad")).toHaveValue("");
  });
  it("submits trimmed numeric text and sorted weekdays", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { id: "habit" } }, { status: 201 }));
    const onCreated = vi.fn();
    render(<CreateHabitForm onCreated={onCreated} />);
    const user = await fill();
    await user.click(screen.getByRole("checkbox", { name: "Domingo" }));
    await user.selectOptions(screen.getByLabelText("Tipo"), "NUMERIC");
    await user.type(screen.getByLabelText("Unidad"), " pages ");
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: "Read", type: "NUMERIC", unit: "pages", frequency: [0, 1] });
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("");
  });
  it("locks rapid keyboard and native submits until confirmation", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
    render(<CreateHabitForm onCreated={vi.fn()} />);
    const user = await fill();
    await user.click(screen.getByRole("textbox", { name: "Nombre" }));
    await user.keyboard("{Enter}{Enter}");
    fireEvent.submit(screen.getByRole("form", { name: "Crear hábito" }));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Creando…" })).toBeDisabled();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty("unit");
    resolve(Response.json({ data: { id: "habit" } }, { status: 201 }));
    await screen.findByText("Hábito creado. Consulta Mis hábitos para verificarlo.");
  });
  it.each([400, 403, 413, 415, 500])("preserves values and allows manual recovery after %i", async (status) => {
    fetchMock.mockResolvedValue(Response.json({ error: { code: "ERROR" } }, { status }));
    const onCreated = vi.fn(); render(<CreateHabitForm onCreated={onCreated} />);
    const user = await fill(); await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(" Read ");
    expect(screen.getByRole("button", { name: "Crear hábito" })).toBeEnabled();
    expect(onCreated).not.toHaveBeenCalled(); expect(fetchMock).toHaveBeenCalledOnce();
    fetchMock.mockResolvedValueOnce(Response.json({ data: { id: "habit" } }, { status: 201 }));
    await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("reports auth loss without success", async () => {
    fetchMock.mockResolvedValue(Response.json({}, { status: 401 }));
    const onUnauthorized = vi.fn(); render(<CreateHabitForm onCreated={vi.fn()} onUnauthorized={onUnauthorized} />);
    const user = await fill(); await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
  });
  it.each(["network", "malformed", "unexpected-status"])("does not claim creation for ambiguous %s outcome", async (failure) => {
    if (failure === "network") fetchMock.mockRejectedValue(new Error("private"));
    else if (failure === "malformed") fetchMock.mockResolvedValue(new Response("{", { status: 201 }));
    else fetchMock.mockResolvedValue(Response.json({ data: { id: "habit" } }));
    const onCreated = vi.fn(); render(<CreateHabitForm onCreated={onCreated} />);
    const user = await fill(); await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Un reintento podría crear un duplicado");
    expect(onCreated).not.toHaveBeenCalled(); expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(" Read ");
  });
  it("aborts pending creation on unmount and ignores late success", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
    const onCreated = vi.fn(); const view = render(<CreateHabitForm onCreated={onCreated} />);
    const user = await fill(); await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    const signal = fetchMock.mock.calls[0][1].signal;
    view.unmount(); expect(signal.aborted).toBe(true);
    resolve(Response.json({ data: { id: "habit" } }, { status: 201 }));
    await waitFor(() => expect(onCreated).not.toHaveBeenCalled());
  });
  it("unlocks confirmed creation while independent catalog refresh is pending", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { id: "habit" } }, { status: 201 }));
    const onCreated = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CreateHabitForm onCreated={onCreated} />);
    const user = await fill(); await user.click(screen.getByRole("button", { name: "Crear hábito" }));
    await screen.findByText("Hábito creado. Consulta Mis hábitos para verificarlo.");
    expect(screen.getByRole("button", { name: "Crear hábito" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("");
  });
});
