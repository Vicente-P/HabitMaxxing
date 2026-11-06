// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUser: vi.fn(), findHabit: vi.fn(), findLogs: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser }, habit: { findUnique: mocks.findHabit }, habitLog: { findMany: mocks.findLogs } },
}));
import { GET } from "@/app/api/habits/[id]/stats/route";

const today = "2026-05-20";
const habitRow = { id: "habit", name: "Read", type: "BINARY", unit: null, frequency: [0, 1, 2, 3, 4, 5, 6], userId: "owner", createdAt: new Date(0), updatedAt: new Date(0) };
const notFound = { error: { code: "NOT_FOUND", message: "Hábito no encontrado" } };

function call(query = "", id = "habit") {
  return GET(new Request(`https://untrusted.example/api/habits/${id}/stats${query}`), { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${today}T10:00:00.000Z`));
  mocks.auth.mockResolvedValue({ user: { id: "owner" } });
  mocks.findUser.mockResolvedValue({ id: "owner" });
  mocks.findHabit.mockResolvedValue(habitRow);
  mocks.findLogs.mockResolvedValue([
    { date: new Date("2026-05-18T00:00:00.000Z"), completed: true },
    { date: new Date("2026-05-19T00:00:00.000Z"), completed: true },
  ]);
});
afterEach(() => { vi.useRealTimers(); });

describe("GET /api/habits/:id/stats", () => {
  it("returns the streak with private no-store headers", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { habitId: "habit", streak: { current: 2, previous: 0, isActive: true } } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findLogs).toHaveBeenCalledWith(expect.objectContaining({ where: { habitId: "habit" } }));
  });

  it("returns current 0 and the broken run as previous", async () => {
    mocks.findLogs.mockResolvedValue([
      { date: new Date("2026-05-10T00:00:00.000Z"), completed: true },
      { date: new Date("2026-05-11T00:00:00.000Z"), completed: true },
      { date: new Date("2026-05-12T00:00:00.000Z"), completed: true },
    ]);
    expect((await (await call()).json()).data.streak).toEqual({ current: 0, previous: 3, isActive: false });
  });

  it.each(["?month=2026-05", "?foo=bar", "?month="])("rejects any query parameter with 400 VALIDATION_ERROR: %s", async (query) => {
    const response = await call(query);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it("answers a foreign habit and a missing habit with the same byte-identical 404", async () => {
    mocks.findHabit.mockResolvedValue({ ...habitRow, userId: "someone-else" });
    const foreign = await call();
    mocks.findHabit.mockResolvedValue(null);
    const missing = await call();
    expect(foreign.status).toBe(404);
    expect(missing.status).toBe(404);
    const foreignBody = await foreign.text();
    expect(foreignBody).toBe(await missing.text());
    expect(JSON.parse(foreignBody)).toEqual(notFound);
    expect(mocks.findLogs).not.toHaveBeenCalled();
  });

  it.each([null, {}, { user: {} }])("returns 401 without a usable session: %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    const response = await call();
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("UNAUTHORIZED");
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it("returns 401 when the session user no longer exists", async () => {
    mocks.findUser.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it("returns a neutral 500 without leaking the failure", async () => {
    mocks.findLogs.mockRejectedValue(new Error("secret connection string"));
    const response = await call();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
  });
});
