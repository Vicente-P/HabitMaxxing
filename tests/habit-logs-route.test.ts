// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), findUser: vi.fn(), findHabit: vi.fn(), upsertLog: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser }, habit: { findUnique: mocks.findHabit }, habitLog: { upsert: mocks.upsertLog } },
}));
import { POST } from "@/app/api/habits/[id]/logs/route";

const origin = "https://habit-maxxing.vercel.app";
const today = "2026-05-20"; // Wednesday
const everyDay = [0, 1, 2, 3, 4, 5, 6];
const habitRow = { id: "habit", name: "Read", type: "BINARY", unit: null, frequency: everyDay, userId: "owner", createdAt: new Date(0), updatedAt: new Date(0) };

function request(body: unknown = { completed: true }, headers: Record<string, string> = {}) {
  return new Request("https://untrusted.example/api/habits/habit/logs", {
    method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
  });
}
function call(req: Request, id = "habit") {
  return POST(req, { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${today}T10:00:00.000Z`));
  vi.stubEnv("APP_ORIGIN", origin);
  mocks.auth.mockResolvedValue({ user: { id: "owner" } });
  mocks.findUser.mockResolvedValue({ id: "owner" });
  mocks.findHabit.mockResolvedValue(habitRow);
  mocks.upsertLog.mockImplementation(async ({ create, update }) => ({
    id: "log", habitId: create.habitId, date: create.date, completed: update.completed, value: null, createdAt: new Date("2026-05-20T10:00:00.000Z"),
  }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("POST /api/habits/:id/logs success", () => {
  it("completes a binary habit for today", async () => {
    const response = await call(request({ completed: true }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { id: "log", habitId: "habit", date: today, completed: true, value: null, createdAt: "2026-05-20T10:00:00.000Z" },
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findHabit).toHaveBeenCalledWith({ where: { id: "habit" }, select: expect.any(Object) });
    expect(mocks.upsertLog).toHaveBeenCalledWith(expect.objectContaining({
      where: { habitId_date: { habitId: "habit", date: new Date(`${today}T00:00:00.000Z`) } },
      create: { habitId: "habit", date: new Date(`${today}T00:00:00.000Z`), completed: true },
      update: { completed: true },
    }));
  });

  it("reverts to pending by upserting completed false", async () => {
    const response = await call(request({ completed: false }));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ completed: false, value: null });
    expect(mocks.upsertLog.mock.calls[0][0].update).toEqual({ completed: false });
  });

  it("accepts an explicit past scheduled date", async () => {
    const response = await call(request({ completed: true, date: "2026-05-13" }));
    expect(response.status).toBe(200);
    expect((await response.json()).data.date).toBe("2026-05-13");
  });
});

describe("POST /api/habits/:id/logs errors", () => {
  it.each([null, {}, { user: {} }, { user: { id: " " } }])("returns 401 before origin/body checks for session %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    const response = await call(request(null, { origin: "null" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it("returns 401 for a deleted account", async () => {
    mocks.findUser.mockResolvedValue(null);
    expect((await call(request())).status).toBe(401);
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("returns 403 for another user's habit without writing", async () => {
    mocks.findHabit.mockResolvedValue({ ...habitRow, userId: "someone-else" });
    const response = await call(request());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: { code: "FORBIDDEN", message: "No tienes permiso para registrar este hábito" } });
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing habit", async () => {
    mocks.findHabit.mockResolvedValue(null);
    const response = await call(request(), "missing");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "NOT_FOUND", message: "Hábito no encontrado" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns 400 for a day the habit is not scheduled", async () => {
    mocks.findHabit.mockResolvedValue({ ...habitRow, frequency: [1] });
    const response = await call(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "VALIDATION_ERROR", message: "Este hábito no está programado para este día" } });
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("returns 400 for a future date", async () => {
    const response = await call(request({ completed: true, date: "2026-05-21" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "VALIDATION_ERROR", message: "No se puede registrar en fechas futuras" } });
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("returns 400 for numeric habits", async () => {
    mocks.findHabit.mockResolvedValue({ ...habitRow, type: "NUMERIC", unit: "pages" });
    const response = await call(request());
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it.each([
    [{}, "completed"],
    [{ completed: "true" }, "completed"],
    [{ completed: 1 }, "completed"],
    [{ completed: true, date: "2026-02-30" }, "date"],
    [{ completed: true, date: "20-05-2026" }, "date"],
    [{ completed: true, date: 20260520 }, "date"],
    [{ completed: true, value: 5 }, "value"],
    [{ completed: true, userId: "foreign" }, "userId"],
  ])("returns 400 with details for invalid body %j", async (body, field) => {
    const response = await call(request(body));
    expect(response.status).toBe(400);
    const { error } = await response.json();
    expect(error).toMatchObject({ code: "VALIDATION_ERROR", message: "Datos de entrada inválidos" });
    expect(error.details).toContainEqual({ field, message: expect.any(String) });
    expect(mocks.findHabit).not.toHaveBeenCalled();
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it.each([null, []])("returns 400 for a non-object body %j", async (body) => {
    expect((await call(request(body))).status).toBe(400);
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("https://example.com", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{" });
    expect((await call(req)).status).toBe(400);
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it.each([
    [{ origin: "https://foreign.example" }, 403],
    [{ "content-type": "text/plain" }, 415],
    [{ "content-length": "9000" }, 413],
  ] as const)("rejects request headers %j with %i before touching the habit", async (headers, status) => {
    const response = await call(request({ completed: true }, headers));
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findHabit).not.toHaveBeenCalled();
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it("fails closed when APP_ORIGIN is missing", async () => {
    vi.stubEnv("APP_ORIGIN", undefined);
    expect((await call(request())).status).toBe(500);
    expect(mocks.upsertLog).not.toHaveBeenCalled();
  });

  it.each(["auth", "findUser", "findHabit", "upsertLog"] as const)("returns a neutral 500 when %s fails", async (name) => {
    mocks[name].mockRejectedValue(new Error("private database secret"));
    const response = await call(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
