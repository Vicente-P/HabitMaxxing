import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signOut, replace } = vi.hoisted(() => ({ signOut: vi.fn(), replace: vi.fn() }));
vi.mock("next-auth/react", () => ({ signOut }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
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
