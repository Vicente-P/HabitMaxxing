import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryPendingLogStore } from "@/lib/offline-logs/memory-store";
import { configurePendingRuntime, pendingRuntime } from "@/lib/offline-logs/pending-runtime";
import OfflineBanner from "./offline-status";

const respond = (status: number) => new Response(null, { status });
let fetchImpl: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchImpl = vi.fn(async () => respond(503));
  configurePendingRuntime({ store: createMemoryPendingLogStore(), fetchImpl: fetchImpl as unknown as typeof fetch });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const setOnline = (value: boolean) => vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(value);

describe("OfflineBanner", () => {
  it("renders nothing while online", () => {
    setOnline(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("warns that the data may be out of date when the app starts offline (CA-02)", () => {
    setOnline(false);
    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión: puede que los datos no estén al día.");
  });

  it("appears and disappears as the connection changes", () => {
    const online = setOnline(true);
    render(<OfflineBanner />);
    online.mockReturnValue(false);
    act(() => { window.dispatchEvent(new Event("offline")); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    online.mockReturnValue(true);
    act(() => { window.dispatchEvent(new Event("online")); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("OfflineBanner pending changes (HU-20)", () => {
  const queue = async (count: number) => {
    await pendingRuntime.init("u1");
    for (let i = 0; i < count; i++) await act(async () => { await pendingRuntime.enqueue({ habitId: `h${i}`, date: "2026-11-06", payload: { completed: true } }); });
  };

  it("shows the singular pending line while online, in the single status element", async () => {
    setOnline(true);
    render(<OfflineBanner />);
    await queue(1);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("1 cambio pendiente de sincronizar.");
    expect(screen.getByRole("status")).not.toHaveTextContent("Sin conexión");
  });

  it("pluralizes the pending count", async () => {
    setOnline(true);
    render(<OfflineBanner />);
    await queue(3);
    expect(screen.getByRole("status")).toHaveTextContent("3 cambios pendientes de sincronizar.");
  });

  it("shows the offline line first and the pending line second in the same status", async () => {
    setOnline(false);
    render(<OfflineBanner />);
    await queue(2);
    const status = screen.getByRole("status");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    const text = status.textContent ?? "";
    expect(text.indexOf("Sin conexión: puede que los datos no estén al día.")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("2 cambios pendientes de sincronizar.")).toBeGreaterThan(text.indexOf("Sin conexión"));
  });

  it("explains a terminated session after a 401, below the pending line", async () => {
    setOnline(true);
    fetchImpl.mockResolvedValue(respond(401));
    render(<OfflineBanner />);
    await queue(1);
    await act(async () => { await pendingRuntime.sync(); });
    const text = screen.getByRole("status").textContent ?? "";
    expect(text).toContain("Tu sesión terminó: los cambios pendientes se enviarán cuando inicies sesión de nuevo.");
    expect(text.indexOf("Tu sesión terminó")).toBeGreaterThan(text.indexOf("1 cambio pendiente"));
  });

  it("renders nothing when online with an empty queue", () => {
    setOnline(true);
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([[404, 1, "No se pudo aplicar 1 cambio porque el hábito ya no existe o no estaba programado ese día."], [400, 2, "No se pudo aplicar 2 cambios porque el hábito ya no existe o no estaba programado ese día."]])(
    "shows a separate alert for %i-rejected changes and dismisses it with Entendido",
    async (status, count, message) => {
      setOnline(true);
      fetchImpl.mockResolvedValue(respond(status));
      render(<OfflineBanner />);
      await queue(count);
      await act(async () => { await pendingRuntime.sync(); });
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(message);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(pendingRuntime.getSnapshot().discarded).toEqual([]);
    },
  );

  it("keeps one status next to the discarded alert while changes are still pending", async () => {
    setOnline(true);
    render(<OfflineBanner />);
    await queue(1);
    fetchImpl.mockResolvedValue(respond(404));
    await act(async () => { await pendingRuntime.sync(); });
    await act(async () => { await pendingRuntime.enqueue({ habitId: "z", date: "2026-11-06", payload: { completed: true } }); });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });
});
