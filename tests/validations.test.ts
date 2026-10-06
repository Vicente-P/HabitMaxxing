import { describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import React from "react";

import { registerSchema } from "@/lib/validations";

describe("registerSchema", () => {
  it("normalizes email and optional name", () => {
    expect(registerSchema.parse({ email: " User@Example.COM ", password: "password123", name: "  User  " })).toMatchObject({
      email: "user@example.com",
      name: "User",
    });
    expect(registerSchema.parse({ email: "user@example.com", password: "password123" }).name).toBeNull();
  });

  it("rejects passwords over 72 UTF-8 bytes", () => {
    const result = registerSchema.safeParse({ email: "user@example.com", password: "á".repeat(37) });
    expect(result.success).toBe(false);
  });
});

const { findUnique, update, compare, authConfiguration } = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), compare: vi.fn(), authConfiguration: { value: undefined as unknown } }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: (work: (tx: unknown) => unknown) => work({ user: { findUnique, update } }) } }));
vi.mock("bcryptjs", () => ({ default: { compare, hash: vi.fn() } }));
vi.mock("next-auth", () => ({ default: (configuration: unknown) => { authConfiguration.value = configuration; return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() }; } }));
vi.mock("next-auth/providers/credentials", () => ({ default: (options: { authorize: (credentials: unknown) => Promise<unknown> }) => options }));
vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => React.createElement("a", { href }, children) }));
vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));

describe("Credentials authorize and auth forms", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

  it("authorizes valid credentials and rejects invalid or mismatched credentials", async () => {
    await import("@/lib/auth");
    const configuration = authConfiguration.value as { providers: Array<{ authorize?: (credentials: unknown) => Promise<unknown> }> };
    const authorize = configuration.providers[0].authorize!;
    findUnique.mockResolvedValue({ id: "u1", email: "user@example.com", name: "User", password: "hash", failedLoginAttempts: 0, lockedUntil: null });
    compare.mockResolvedValue(true);
    expect(await authorize({ email: "user@example.com", password: "password123" })).toEqual({ id: "u1", email: "user@example.com", name: "User" });
    compare.mockResolvedValue(false);
    expect(await authorize({ email: "user@example.com", password: "password123" })).toBeNull();
    expect(await authorize({ email: "invalid", password: "short" })).toBeNull();
  });

  it.each([false, true])("shows registration recovery after a sign-in error with HTTP ok=%s", async (ok) => {
    vi.mocked((await import("next-auth/react")).signIn).mockResolvedValue({ ok, error: "CredentialsSignin" } as never);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Tu cuenta fue creada"));
    expect(screen.getByRole("link", { name: /Inicia sesión/ })).toHaveAttribute("href", "/login");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it.each([false, true])("shows neutral login feedback for a sign-in error with HTTP ok=%s", async (ok) => {
    vi.mocked((await import("next-auth/react")).signIn).mockResolvedValue({ ok, error: "CredentialsSignin" } as never);
    const { default: LoginPage } = await import("@/app/(auth)/login/page");
    render(React.createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Credenciales incorrectas"));
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
  });

  it("offers manual login when automatic sign-in rejects after account creation", async () => {
    const signIn = vi.mocked((await import("next-auth/react")).signIn);
    signIn.mockRejectedValue(new Error("internal sign-in failure"));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Tu cuenta fue creada, pero no pudimos iniciar sesión. Inicia sesión para continuar."));
    expect(screen.getByRole("link", { name: /Inicia sesión/ })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
    expect(fetch).toHaveBeenCalledOnce();
    expect(signIn).toHaveBeenCalledOnce();
  });

  it("keeps registration request failures generic without attempting sign-in", async () => {
    const signIn = vi.mocked((await import("next-auth/react")).signIn);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("registration unavailable")));
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Ocurrió un error. Inténtalo de nuevo."));
    expect(screen.getByRole("alert")).not.toHaveTextContent("Tu cuenta fue creada");
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
    expect(fetch).toHaveBeenCalledOnce();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("focuses the password input when email is valid but the password is invalid", async () => {
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Contraseña"));
  });

  it("does not show unrelated field errors when one untouched field blurs", async () => {
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.focus(screen.getByLabelText("Correo electrónico"));
    fireEvent.blur(screen.getByLabelText("Correo electrónico"));
    expect(screen.getByText("Ingresa un correo electrónico válido")).toBeInTheDocument();
    expect(screen.queryByText("La contraseña debe tener al menos 8 caracteres")).not.toBeInTheDocument();
  });

  it("renders field details returned by a server validation error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: { details: [{ field: "password", message: "La contraseña fue rechazada" }] } }),
    }));
    const { default: RegisterPage } = await import("@/app/(auth)/register/page");
    render(React.createElement(RegisterPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await waitFor(() => expect(screen.getByText("La contraseña fue rechazada")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos indicados.");
  });

  it("recovers the login pending state and presents a neutral accessible error", async () => {
    vi.mocked((await import("next-auth/react")).signIn).mockRejectedValue(new Error("internal"));
    const { default: LoginPage } = await import("@/app/(auth)/login/page");
    render(React.createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No se pudo iniciar sesión"));
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
    expect(screen.getByRole("alert")).not.toHaveTextContent("internal");
  });

  it("configures a 30-day native JWT session and exposes only safe user identity", async () => {
    await import("@/lib/auth");
    const configuration = authConfiguration.value as {
      session: { strategy: string; maxAge?: number };
      callbacks: {
        jwt: (input: { token: Record<string, unknown>; user?: Record<string, unknown> }) => Record<string, unknown>;
        session: (input: { session: { user: Record<string, unknown>; expires: string }; token: Record<string, unknown> }) => { user: Record<string, unknown>; expires: string };
      };
    };
    expect(configuration.session).toEqual({ strategy: "jwt", maxAge: 30 * 24 * 60 * 60 });
    const identity = { name: "User", email: "user@example.com", picture: null };
    const token = configuration.callbacks.jwt({ token: { ...identity }, user: { id: "u1", password: "private", failedLoginAttempts: 4, lockedUntil: new Date() } });
    expect(token).toEqual({ ...identity, sub: "u1" });
    expect(configuration.callbacks.jwt({ token })).toEqual(token);
    const session = configuration.callbacks.session({ session: { user: { name: identity.name, email: identity.email, image: null }, expires: "2030-01-01T00:00:00Z" }, token });
    expect(session).toEqual({ user: { id: "u1", name: identity.name, email: identity.email, image: null }, expires: "2030-01-01T00:00:00Z" });
    expect(JSON.stringify({ token, session })).not.toMatch(/password|private|failedLoginAttempts|lockedUntil/);
    expect(configuration.callbacks.session({ session: { user: {}, expires: "unchanged" }, token: {} })).toEqual({ user: {}, expires: "unchanged" });
  });

  it("keeps the login button disabled while native sign-in is pending and restores it on non-ok", async () => {
    let finish!: (value: never) => void;
    const signIn = vi.mocked((await import("next-auth/react")).signIn);
    signIn.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { default: LoginPage } = await import("@/app/(auth)/login/page");
    render(React.createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    const pending = screen.getByRole("button", { name: "Iniciando sesión…" });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(signIn).toHaveBeenCalledOnce();
    finish({ ok: false } as never);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Credenciales incorrectas"));
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
  });

  it("navigates only after a successful sign-in without a semantic error", async () => {
    let finish!: (value: never) => void;
    const signIn = vi.mocked((await import("next-auth/react")).signIn);
    signIn.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { default: LoginPage } = await import("@/app/(auth)/login/page");
    render(React.createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });
    await act(async () => { finish({ ok: true, error: undefined } as never); });
    vi.unstubAllGlobals();
    expect(assign).toHaveBeenCalledExactlyOnceWith("/dashboard");
    expect(signIn).toHaveBeenCalledExactlyOnceWith("credentials", { email: "user@example.com", password: "password123", redirect: false });
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });
});
