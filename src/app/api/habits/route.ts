import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHabitSchema } from "@/lib/validations";
import { createHabit, listDailyHabits, listHabitCatalog, requireHabitOwner } from "@/lib/habits";
import { checkHabitRequest, readHabitBody, habitInternalError, habitValidationError, type HabitRequestError } from "@/lib/habit-request";

const responseHeaders = { "Cache-Control": "private, no-store" };

function errorResponse(error: HabitRequestError, details?: Array<{ field: string; message: string }>) {
  return NextResponse.json({ error: { code: error.code, message: error.message, ...(details ? { details } : {}) } }, { status: error.status, headers: responseHeaders });
}

export async function POST(request: Request) {
  try {
    const ownerId = await requireHabitOwner(await auth(), prisma);
    if (!ownerId) return errorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitRequest(request, process.env.APP_ORIGIN);
    if (requestError) return errorResponse(requestError);
    const body = await readHabitBody(request);
    if ("error" in body) return errorResponse(body.error, body.error.status === 400 ? [] : undefined);
    const parsed = createHabitSchema.safeParse(body.data);
    if (!parsed.success) {
      return errorResponse(habitValidationError, parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? "form"), message: issue.message })));
    }
    const habit = await createHabit(parsed.data, ownerId, prisma);
    return NextResponse.json({ data: habit }, { status: 201, headers: responseHeaders });
  } catch {
    return errorResponse(habitInternalError);
  }
}

export async function GET(request: Request) {
  try {
    const ownerId = await requireHabitOwner(await auth(), prisma);
    if (!ownerId) return errorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const params = new URL(request.url).searchParams;
    if (params.has("view")) {
      if (params.size !== 1 || params.get("view") !== "catalog") {
        return errorResponse(habitValidationError, [{ field: "view", message: "Se requiere únicamente view=catalog" }]);
      }
      const habits = await listHabitCatalog(ownerId, prisma);
      return NextResponse.json({ data: habits }, { status: 200, headers: responseHeaders });
    }

    const keys = [...params.keys()];
    if (keys.some((key) => key !== "date" && key !== "day") || params.getAll("date").length > 1 || params.getAll("day").length > 1) {
      return errorResponse(habitValidationError, [{ field: "query", message: "Los parámetros permitidos son date y day" }]);
    }

    const requestedDate = params.get("date");
    if (requestedDate !== null) {
      const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? new Date(`${requestedDate}T00:00:00.000Z`) : null;
      if (!parsedDate || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== requestedDate) {
        return errorResponse(habitValidationError, [{ field: "date", message: "La fecha debe tener formato YYYY-MM-DD válido" }]);
      }
    }
    const requestedDay = params.get("day");
    if (requestedDay !== null && !/^[0-6]$/.test(requestedDay)) {
      return errorResponse(habitValidationError, [{ field: "day", message: "El día debe ser un entero entre 0 y 6" }]);
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const date = requestedDate ?? currentDate;
    const day = requestedDate !== null ? new Date(`${requestedDate}T00:00:00.000Z`).getUTCDay() : requestedDay !== null ? Number(requestedDay) : new Date(`${currentDate}T00:00:00.000Z`).getUTCDay();
    const result = await listDailyHabits(ownerId, day, date, prisma);
    return NextResponse.json(result, { status: 200, headers: responseHeaders });
  } catch {
    return errorResponse(habitInternalError);
  }
}
