// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUnique }, habit: { create: mocks.create, findMany: mocks.findMany } } }));
import { GET, POST } from "@/app/api/habits/route";

const origin = "https://habit-maxxing.vercel.app";
const binary = { name: " Read ", type: "BINARY", frequency: [6, 0] };
function request(body: unknown = binary, headers: Record<string, string> = {}) {
  return new Request("https://untrusted.example/api/habits", { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("APP_ORIGIN", origin);
  mocks.auth.mockResolvedValue({ user: { id: "owner" } });
  mocks.findUnique.mockResolvedValue({ id: "owner" });
  mocks.findMany.mockResolvedValue([]);
  mocks.create.mockImplementation(async ({ data }) => ({ id: "habit", ...data, createdAt: new Date(0), updatedAt: new Date(0) }));
});

describe("GET /api/habits catalog", () => {
  function getRequest(query = "?view=catalog", headers: HeadersInit = {}) {
    return new Request(`https://example.com/api/habits${query}`, { headers });
  }

  it("returns empty catalog without requiring Origin or APP_ORIGIN", async () => {
    vi.stubEnv("APP_ORIGIN", undefined);
    const response = await GET(getRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [] });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.has("access-control-allow-origin")).toBe(false);
  });

  it("returns off-day habits with no agenda fields or account information", async () => {
    const habit = { id: "off-day", name: "Read", type: "BINARY", unit: null, frequency: [0], userId: "owner", createdAt: new Date(0), updatedAt: new Date(0) };
    mocks.findMany.mockResolvedValue([{ ...habit, logs: [], user: { password: "private" } }]);
    const response = await GET(getRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [{ ...habit, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() }] });
    expect(mocks.findMany).toHaveBeenCalledWith({ where: { userId: "owner" }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], select: { id: true, name: true, type: true, unit: true, frequency: true, userId: true, createdAt: true, updatedAt: true } });
  });

  it.each(["owner", "different-owner"])("uses only session owner %s", async (ownerId) => {
    mocks.auth.mockResolvedValue({ user: { id: ownerId } });
    await GET(getRequest());
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { id: ownerId }, select: { id: true } });
    expect(mocks.findMany.mock.calls[0][0].where).toEqual({ userId: ownerId });
  });

  it.each(["", "?view=catalog", "?userId=foreign"])("rejects anonymous requests before querying or parsing %s", async (query) => {
    mocks.auth.mockResolvedValue(null);
    const response = await GET(getRequest(query));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it.each([{}, { user: {} }, { user: { id: "" } }, { user: { id: " " } }, { user: { id: 3 } }])("rejects invalid identity %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    expect((await GET(getRequest())).status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("rejects an account that no longer exists", async () => {
    mocks.findUnique.mockResolvedValue(null);
    expect((await GET(getRequest())).status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it.each([
    "", "?view=", "?view=daily", "?view=Catalog", "?view=catalog&view=catalog",
    "?view=catalog&view=daily", "?view=catalog&day=1", "?view=catalog&date=2026-10-08",
    "?view=catalog&userId=foreign", "?view=catalog&extra=1", "?day=1", "?view=catalog&=x",
    "?view=catalog%00", "?view=catalog%20", "?view[]=catalog", "?VIEW=catalog",
  ])("rejects unsupported query %s before catalog access", async (query) => {
    const response = await GET(getRequest(query));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it.each(["auth", "findUnique", "findMany"] as const)("returns neutral error on %s failure", async (method) => {
    mocks[method].mockRejectedValue(new Error("private"));
    const response = await GET(getRequest());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    if (method !== "findMany") expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/habits", () => {
  it("never exposes relations or unexpected database fields", async () => {
    mocks.create.mockResolvedValue({ id: "habit", name: "Read", type: "BINARY", unit: null, frequency: [0, 6], userId: "owner", createdAt: new Date(0), updatedAt: new Date(0), user: { password: "private" }, logs: [], secret: "private" });
    const response = await POST(request());
    const { data } = await response.json();
    expect(Object.keys(data).sort()).toEqual(["createdAt", "frequency", "id", "name", "type", "unit", "updatedAt", "userId"].sort());
  });
  it.each([binary, { ...binary, type: "NUMERIC", unit: " pages " }])("creates normalized own habit %j", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ data: { id: "habit", name: "Read", type: body.type, unit: "unit" in body ? "pages" : null, frequency: [0, 6], userId: "owner", createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it.each([null, {}, { user: {} }, { user: { id: "" } }, { user: { id: " " } }, { user: { id: 3 } }])("authenticates before origin/body validation %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    const response = await POST(request(null, { origin: "null" }));
    expect(response.status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects deleted accounts", async () => {
    mocks.findUnique.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each(["auth", "findUnique", "create"] as const)("returns neutral failure for %s faults", async (method) => {
    mocks[method].mockRejectedValue(new Error("private database secret"));
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    if (method !== "create") expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each([{ ...binary, userId: "foreign" }, { ...binary, unit: null }, { ...binary, frequency: [] }, { ...binary, name: " " }, null, []])("rejects input before insertion %j", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("returns field validation details", async () => {
    const response = await POST(request({ ...binary, name: " " }));
    expect((await response.json()).error.details).toContainEqual({ field: "name", message: "El nombre del hábito es obligatorio" });
  });
  it.each([
    [{ origin: "https://foreign.example" }, 403],
    [{ "content-type": "text/plain" }, 415],
    [{ "content-length": "9000" }, 413],
  ] as const)("does not insert for rejected request %j", async (headers, status) => {
    const response = await POST(request(binary, headers));
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("fails closed for missing config", async () => {
    vi.stubEnv("APP_ORIGIN", undefined);
    expect((await POST(request())).status).toBe(500);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    const req = new Request("https://example.com", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{" });
    expect((await POST(req)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
