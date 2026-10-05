import { beforeEach, describe, expect, it, vi } from "vitest";

const { userCreate, userFindUnique, hash } = vi.hoisted(() => ({
  userCreate: vi.fn(),
  userFindUnique: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { create: userCreate, findUnique: userFindUnique } } }));
vi.mock("bcryptjs", () => ({ default: { hash } }));

import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userFindUnique.mockResolvedValue(null);
    hash.mockResolvedValue("$2b$12$hash");
    userCreate.mockResolvedValue({ id: "user-1", email: "user@example.com", name: null, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01") });
  });

  it("creates a safe response and hashes the password", async () => {
    const response = await POST(new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: " User@Example.COM ", password: "password123" }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(201);
    expect(hash).toHaveBeenCalledWith("password123", 12);
    expect(userCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ email: "user@example.com", password: "$2b$12$hash", name: null }) }));
    expect(await response.json()).not.toHaveProperty("data.password");
  });

  it("returns a neutral conflict for an existing email", async () => {
    userFindUnique.mockResolvedValue({ id: "existing" });
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: JSON.stringify({ email: "user@example.com", password: "password123" }) }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: { code: "CONFLICT", message: "No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo" } });
    expect(userCreate).not.toHaveBeenCalled();
  });

  it.each([
    { email: "not-an-email", password: "password123" },
    { email: "user@example.com", password: "short" },
    null,
  ])("rejects invalid payloads without persistence", async (body) => {
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(400);
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(userCreate).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without persistence", async () => {
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(userCreate).not.toHaveBeenCalled();
  });

  it.each(["hash", "persistence"] as const)("returns a generic 500 on %s failure", async (stage) => {
    const internal = new Error("secret database detail");
    if (stage === "hash") hash.mockRejectedValue(internal);
    else userCreate.mockRejectedValue(internal);
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: JSON.stringify({ email: "user@example.com", password: "password123" }) }));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret database detail");
    if (stage === "hash") expect(userCreate).not.toHaveBeenCalled();
    else expect(userCreate).toHaveBeenCalledOnce();
  });

  it("preserves the created account when sign-in recovery is needed", async () => {
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: JSON.stringify({ email: "user@example.com", password: "password123" }) }));
    expect(response.status).toBe(201);
    expect(userCreate).toHaveBeenCalledOnce();
    // The client recovery link is rendered by the registration form; this route never rolls back a created account.
  });
});
