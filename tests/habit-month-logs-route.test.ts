// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUser: vi.fn(), findHabit: vi.fn(), findLogs: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser }, habit: { findUnique: mocks.findHabit }, habitLog: { findMany: mocks.findLogs, upsert: vi.fn() } },
}));
import { GET } from "@/app/api/habits/[id]/logs/route";

const habitRow = { id: "habit", name: "Run", type: "NUMERIC", unit: "km", frequency: [1, 2, 3], userId: "owner", createdAt: new Date("2026-05-10T08:00:00.000Z"), updatedAt: new Date(0) };
const notFound = { error: { code: "NOT_FOUND", message: "Hábito no encontrado" } };
const invalidMonth = { error: { code: "VALIDATION_ERROR", message: "Datos de entrada inválidos", details: [{ field: "month", message: "Formato de mes inválido. Usar YYYY-MM" }] } };

function call(query = "?month=2026-05", id = "habit") {
  return GET(new Request(`https://untrusted.example/api/habits/${id}/logs${query}`), { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-05-20T10:00:00.000Z"));
  mocks.auth.mockResolvedValue({ user: { id: "owner" } });
  mocks.findUser.mockResolvedValue({ id: "owner" });
  mocks.findHabit.mockResolvedValue(habitRow);
  mocks.findLogs.mockResolvedValue([
    { id: "log-12", completed: true, value: 5, date: new Date("2026-05-12T00:00:00.000Z") },
    { id: "log-13", completed: false, value: null, date: new Date("2026-05-13T00:00:00.000Z") },
  ]);
});
afterEach(() => { vi.useRealTimers(); });

describe("GET /api/habits/:id/logs?month=", () => {
  it("returns every day of the month with its status and log, with private no-store headers (S2)", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const { data } = await response.json();
    expect(Object.keys(data)).toEqual(["habitId", "month", "days"]);
    expect(data.habitId).toBe("habit");
    expect(data.month).toBe("2026-05");
    expect(data.days).toHaveLength(31);
    expect(data.days[0]).toEqual({ date: "2026-05-01", dayOfWeek: 5, scheduled: false, status: "not_scheduled", log: null });
    expect(data.days[11]).toEqual({ date: "2026-05-12", dayOfWeek: 2, scheduled: true, status: "completed", log: { id: "log-12", completed: true, value: 5 } });
    expect(data.days[12]).toEqual({ date: "2026-05-13", dayOfWeek: 3, scheduled: true, status: "missed", log: { id: "log-13", completed: false, value: null } });
    expect(data.days[25]).toEqual({ date: "2026-05-26", dayOfWeek: 2, scheduled: true, status: "pending", log: null });
  });

  it("reads only the logs of the requested month for that habit", async () => {
    await call();
    expect(mocks.findLogs).toHaveBeenCalledTimes(1);
    const query = JSON.stringify(mocks.findLogs.mock.calls[0][0]);
    expect(query).toContain("habit");
    expect(query).toContain("2026-05-01");
    expect(query).toContain("2026-05-31");
  });

  it.each(["", "?month=", "?month=2026-5", "?month=2026-13", "?month=abc", "?month=2026-05&month=2026-04", "?month=2026-05&month=2026-05"])("rejects %j with 400 and the month detail", async (query) => {
    const response = await call(query);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(invalidMonth);
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it("rejects any other query parameter with 400", async () => {
    const response = await call("?month=2026-05&x=1");
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });

  it("answers a foreign habit and a missing habit with the same 404, byte for byte", async () => {
    mocks.findHabit.mockResolvedValue({ ...habitRow, userId: "intruder" });
    const foreign = await call();
    mocks.findHabit.mockResolvedValue(null);
    const missing = await call("?month=2026-05", "nope");
    expect(foreign.status).toBe(404);
    expect(await foreign.text()).toBe(await missing.text());
    expect(await (await call("?month=2026-05", "nope")).json()).toEqual(notFound);
    expect(mocks.findLogs).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await call();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" } });
  });

  it("returns a neutral 500 when the database fails", async () => {
    mocks.findLogs.mockRejectedValue(new Error("secret db detail"));
    const response = await call();
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
