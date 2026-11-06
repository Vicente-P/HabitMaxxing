// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), findUser: vi.fn(), findHabit: vi.fn(), updateHabits: vi.fn(), findLogs: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    habit: { findUnique: mocks.findHabit, updateMany: mocks.updateHabits },
    habitLog: { findMany: mocks.findLogs },
  },
}));
import { PATCH } from "@/app/api/habits/[id]/route";

const origin = "https://habit-maxxing.vercel.app";
const stored = {
  id: "habit", name: "Run", type: "NUMERIC", unit: "km", frequency: [1, 2, 3, 4, 5], userId: "owner",
  createdAt: new Date("2026-05-22T11:00:00.000Z"), updatedAt: new Date("2026-05-22T11:00:00.000Z"),
};
const binary = { ...stored, name: "Read", type: "BINARY", unit: null };
const notFound = { error: { code: "NOT_FOUND", message: "Hábito no encontrado" } };
const validation = (field: string, message: string) => ({ error: { code: "VALIDATION_ERROR", message: "Datos de entrada inválidos", details: [{ field, message }] } });

let current: typeof stored | typeof binary | null;

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://untrusted.example/api/habits/habit", {
    method: "PATCH", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
  });
}
function call(req: Request, id = "habit") {
  return PATCH(req, { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("APP_ORIGIN", origin);
  current = stored;
  mocks.auth.mockResolvedValue({ user: { id: "owner" } });
  mocks.findUser.mockResolvedValue({ id: "owner" });
  mocks.findHabit.mockImplementation(async () => current);
  mocks.updateHabits.mockImplementation(async ({ where, data }) => {
    if (!current || where.id !== current.id || where.userId !== current.userId) return { count: 0 };
    current = { ...current, ...data, updatedAt: new Date("2026-05-22T12:00:00.000Z") };
    return { count: 1 };
  });
  mocks.findLogs.mockResolvedValue([]);
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("PATCH /api/habits/:id success", () => {
  it("updates the name and returns the habit", async () => {
    const response = await call(request({ name: " Correr 5K " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { ...stored, name: "Correr 5K", createdAt: "2026-05-22T11:00:00.000Z", updatedAt: "2026-05-22T12:00:00.000Z" },
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.updateHabits).toHaveBeenCalledWith({ where: { id: "habit", userId: "owner" }, data: { name: "Correr 5K" } });
  });

  it("updates the frequency sorted and the unit of a numeric habit", async () => {
    const response = await call(request({ frequency: [5, 1], unit: "mi" }));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ frequency: [1, 5], unit: "mi", type: "NUMERIC" });
  });

  it("warns FREQUENCY_DAYS_REMOVED with the removed days that have logs, and deletes no logs", async () => {
    mocks.findLogs.mockResolvedValue([
      { date: new Date("2026-05-19T00:00:00.000Z") }, // Tuesday (2)
      { date: new Date("2026-05-21T00:00:00.000Z") }, // Thursday (4)
      { date: new Date("2026-05-18T00:00:00.000Z") }, // Monday (1), kept
    ]);
    const response = await call(request({ frequency: [1, 3, 5] }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.frequency).toEqual([1, 3, 5]);
    expect(body.warnings).toEqual([{ code: "FREQUENCY_DAYS_REMOVED", message: "Los registros de ese día no serán eliminados", removedDays: [2, 4] }]);
    expect(mocks.findLogs).toHaveBeenCalledWith(expect.objectContaining({ where: { habitId: "habit" } }));
  });

  it("omits warnings when the removed days have no logs", async () => {
    const response = await call(request({ frequency: [1] }));
    expect(await response.json()).not.toHaveProperty("warnings");
  });
});

describe("PATCH /api/habits/:id ownership", () => {
  it("returns 404 for another user's habit without writing", async () => {
    current = { ...stored, userId: "someone-else" };
    const response = await call(request({ name: "Mine" }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual(notFound);
    expect(mocks.updateHabits).not.toHaveBeenCalled();
    expect(current.name).toBe("Run");
  });

  it("answers a foreign habit and a missing habit with byte-identical responses", async () => {
    current = { ...stored, userId: "someone-else" };
    const foreign = await call(request({ name: "Mine" }));
    current = null;
    const missing = await call(request({ name: "Mine" }), "missing");
    expect(foreign.status).toBe(missing.status);
    expect([...foreign.headers.entries()]).toEqual([...missing.headers.entries()]);
    expect(await foreign.text()).toBe(await missing.text());
  });

  it("returns 404 when the owner-scoped write matches nothing", async () => {
    mocks.updateHabits.mockResolvedValue({ count: 0 });
    const response = await call(request({ name: "Raced" }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual(notFound);
  });

  it.each([null, {}, { user: {} }, { user: { id: " " } }])("returns 401 before origin/body checks for session %j", async (session) => {
    mocks.auth.mockResolvedValue(session);
    const response = await call(request(null, { origin: "null" }));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("UNAUTHORIZED");
    expect(mocks.findHabit).not.toHaveBeenCalled();
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it("returns 401 for a deleted account", async () => {
    mocks.findUser.mockResolvedValue(null);
    expect((await call(request({ name: "Read" }))).status).toBe(401);
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/habits/:id validation", () => {
  it.each([
    [{ type: "BINARY" }, "type", "El tipo de un hábito no se puede modificar"],
    [{}, "form", "Debes enviar al menos un campo para actualizar"],
    [{ name: "" }, "name", "El nombre del hábito es obligatorio"],
    [{ frequency: [] }, "frequency", "Debes seleccionar al menos un día"],
  ])("returns 400 for %j without querying or writing", async (body, field, message) => {
    const response = await call(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(validation(field, message));
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown key such as userId", async () => {
    const response = await call(request({ userId: "someone-else" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.details[0].field).toBe("userId");
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it("returns 400 for a unit on a binary habit", async () => {
    current = binary;
    const response = await call(request({ unit: "pages" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(validation("unit", "Los hábitos binarios no tienen unidad"));
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it.each([null, ""])("returns 400 for unit %j on a numeric habit", async (unit) => {
    const response = await call(request({ unit }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(validation("unit", "La unidad es obligatoria para hábitos numéricos"));
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it("returns 400 for a foreign habit with an invalid body, before any lookup", async () => {
    current = { ...stored, userId: "someone-else" };
    expect((await call(request({ type: "BINARY" }))).status).toBe(400);
    expect(mocks.findHabit).not.toHaveBeenCalled();
  });

  it.each([
    [{ origin: "https://foreign.example" }, 403],
    [{ "content-type": "text/plain" }, 415],
  ])("rejects request headers %j with %d", async (headers, status) => {
    expect((await call(request({ name: "Read" }, headers))).status).toBe(status);
    expect(mocks.updateHabits).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("https://example.com", { method: "PATCH", headers: { origin, "content-type": "application/json" }, body: "{" });
    expect((await call(req)).status).toBe(400);
  });

  it.each(["auth", "findUser", "findHabit", "updateHabits", "findLogs"] as const)("returns a neutral 500 when %s fails", async (name) => {
    mocks[name].mockRejectedValue(new Error("secret detail"));
    const response = await call(request({ frequency: [1] }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } });
  });
});
