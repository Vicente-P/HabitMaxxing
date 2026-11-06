import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signOut, replace } = vi.hoisted(() => ({ signOut: vi.fn(), replace: vi.fn() }));
vi.mock("next-auth/react", () => ({ signOut }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
const { clearOfflineCaches } = vi.hoisted(() => ({ clearOfflineCaches: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/offline-cache", () => ({ clearOfflineCaches }));
import { createMemoryPendingLogStore } from "@/lib/offline-logs/memory-store";
import { configurePendingRuntime, pendingRuntime } from "@/lib/offline-logs/pending-runtime";
import LogoutButton from "./logout-button";

const response = (body: unknown, overrides = {}) => ({ ok: true, redirected: false, json: vi.fn().mockResolvedValue(body), ...overrides });
const click = () => fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

describe("confirmed native logout", () => {
  beforeEach(() => {
    signOut.mockResolvedValue({ url: "/login" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(null)));
  });
  afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

  it("uses native signout and navigates only after explicit successful session-null confirmation", async () => {
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/login"));
    expect(signOut).toHaveBeenCalledExactlyOnceWith({ redirect: false, redirectTo: "/login" });
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/api/auth/session", { cache: "no-store", credentials: "same-origin", redirect: "error" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears the offline caches once logout is confirmed, before leaving the app", async () => {
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
    expect(clearOfflineCaches).toHaveBeenCalledOnce();
    expect(clearOfflineCaches.mock.invocationCallOrder[0]).toBeLessThan(replace.mock.invocationCallOrder[0]);
  });

  it("keeps the offline caches when logout is not confirmed", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ user: { id: "user" } }) as unknown as Response);
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(clearOfflineCaches).not.toHaveBeenCalled();
  });

  it.each([
    ["remaining session", response({ user: { id: "user" } })],
    ["HTTP error with null body", response(null, { ok: false })],
    ["redirected response", response(null, { redirected: true })],
    ["malformed session", response({})],
    ["missing session body", response(undefined)],
    ["invalid JSON", response(null, { json: vi.fn().mockRejectedValue(new Error("parse failure")) })],
  ])("does not claim success for %s and permits retry", async (_name, result) => {
    vi.mocked(fetch).mockResolvedValueOnce(result as unknown as Response);
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No pudimos confirmar el cierre de sesión. Inténtalo de nuevo."));
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
    click();
    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
    expect(signOut).toHaveBeenCalledTimes(2);
  });

  it.each(["signout", "session read"])("recovers neutrally when %s rejects", async (stage) => {
    if (stage === "signout") signOut.mockRejectedValueOnce(new Error("private failure detail"));
    else vi.mocked(fetch).mockRejectedValueOnce(new Error("private failure detail"));
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert")).not.toHaveTextContent("private failure detail");
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("disables duplicate attempts throughout native signout and session verification", async () => {
    let finishSignOut!: (value: unknown) => void;
    let finishSession!: (value: Response) => void;
    signOut.mockImplementation(() => new Promise((resolve) => { finishSignOut = resolve; }));
    vi.mocked(fetch).mockImplementation(() => new Promise((resolve) => { finishSession = resolve; }));
    render(<LogoutButton />);
    click();
    const pending = screen.getByRole("button", { name: "Cerrando sesión…" });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(signOut).toHaveBeenCalledOnce();
    await act(async () => { finishSignOut({ url: "/login" }); });
    expect(pending).toBeDisabled();
    expect(replace).not.toHaveBeenCalled();
    await act(async () => { finishSession(response(null) as unknown as Response); });
    expect(replace).toHaveBeenCalledOnce();
  });

  it("does not navigate after the control unmounts during signout", async () => {
    let finish!: (value: unknown) => void;
    signOut.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const view = render(<LogoutButton />);
    click();
    view.unmount();
    await act(async () => { finish({ url: "/login" }); });
    expect(fetch).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("logout guard with pending offline changes (HU-20 S6)", () => {
  let syncFetch: ReturnType<typeof vi.fn>;
  const store = () => pendingRuntime.getSnapshot().pending;

  beforeEach(async () => {
    signOut.mockResolvedValue({ url: "/login" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(null)));
    syncFetch = vi.fn(async () => new Response(null, { status: 503 }));
    configurePendingRuntime({ store: createMemoryPendingLogStore(), fetchImpl: syncFetch as unknown as typeof fetch });
    await pendingRuntime.init("u1");
  });
  afterEach(() => { cleanup(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

  const queue = async (count: number) => {
    for (let i = 0; i < count; i++) await pendingRuntime.enqueue({ habitId: `h${i}`, date: "2026-11-06", payload: { completed: true } });
  };

  it("logs out normally, without syncing, when nothing is pending", async () => {
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
    expect(syncFetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([[1, "Tienes 1 cambio sin sincronizar. Si cierras sesión se perderán."], [2, "Tienes 2 cambios sin sincronizar. Si cierras sesión se perderán."]])(
    "keeps the session and warns when %i change(s) remain after syncing",
    async (count, message) => {
      await queue(count);
      render(<LogoutButton />);
      click();
      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(syncFetch).toHaveBeenCalled();
      expect(signOut).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
      expect(store()).toHaveLength(count);
      expect(screen.getByRole("button", { name: "Cerrar sesión y descartar" })).toBeEnabled();
    },
  );

  it("discards the queue and then runs the normal logout on the second click", async () => {
    await queue(2);
    render(<LogoutButton />);
    click();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión y descartar" }));
    await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/login"));
    expect(store()).toEqual([]);
    expect(signOut).toHaveBeenCalledOnce();
    expect(clearOfflineCaches).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("logs out normally when the sync clears every pending change", async () => {
    await queue(2);
    syncFetch.mockResolvedValue(new Response(null, { status: 200 }));
    render(<LogoutButton />);
    click();
    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
    expect(syncFetch).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("returns to the plain label and logs out normally if the queue empties before the second click", async () => {
    await queue(1);
    render(<LogoutButton />);
    click();
    await screen.findByRole("alert");
    await act(async () => { await pendingRuntime.discardAll(); });
    fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/ }));
    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
  });
});
