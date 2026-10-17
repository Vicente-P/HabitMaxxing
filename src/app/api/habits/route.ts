import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { checkHabitRequest, readHabitBody, habitInternalError, habitValidationError } from "@/shared/http/habit-request";
import { habitErrorResponse as errorResponse, habitResponseHeaders as responseHeaders } from "@/shared/http/habit-response";
import { createHabitSchema } from "@/features/habits";
import { createHabit } from "@/features/habits/application/create-habit";
import { listDailyHabits } from "@/features/habits/application/list-daily-habits";
import { listHabitCatalog } from "@/features/habits/application/list-habit-catalog";
import { resolveDailyAgendaQuery } from "@/features/habits/domain/daily-query";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

export async function POST(request: Request) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return errorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitRequest(request, process.env.APP_ORIGIN);
    if (requestError) return errorResponse(requestError);
    const body = await readHabitBody(request);
    if ("error" in body) return errorResponse(body.error, body.error.status === 400 ? [] : undefined);
    const parsed = createHabitSchema.safeParse(body.data);
    if (!parsed.success) {
      return errorResponse(habitValidationError, parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? "form"), message: issue.message })));
    }
    const habit = await createHabit(parsed.data, ownerId, habitRepository);
    return NextResponse.json({ data: habit }, { status: 201, headers: responseHeaders });
  } catch {
    return errorResponse(habitInternalError);
  }
}

export async function GET(request: Request) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return errorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const params = new URL(request.url).searchParams;
    if (params.has("view")) {
      if (params.size !== 1 || params.get("view") !== "catalog") {
        return errorResponse(habitValidationError, [{ field: "view", message: "Se requiere únicamente view=catalog" }]);
      }
      const habits = await listHabitCatalog(ownerId, habitRepository);
      return NextResponse.json({ data: habits }, { status: 200, headers: responseHeaders });
    }

    const keys = [...params.keys()];
    if (keys.some((key) => key !== "date" && key !== "day") || params.getAll("date").length > 1 || params.getAll("day").length > 1) {
      return errorResponse(habitValidationError, [{ field: "query", message: "Los parámetros permitidos son date y day" }]);
    }

    const query = resolveDailyAgendaQuery({ date: params.get("date"), day: params.get("day") }, new Date().toISOString().slice(0, 10));
    if (!query.ok) {
      return errorResponse(habitValidationError, [{ field: query.field, message: query.message }]);
    }
    const result = await listDailyHabits(ownerId, query.day, query.date, habitRepository);
    return NextResponse.json(result, { status: 200, headers: responseHeaders });
  } catch {
    return errorResponse(habitInternalError);
  }
}
