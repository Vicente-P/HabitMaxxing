import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { habitInternalError, habitValidationError } from "@/shared/http/habit-request";
import { habitErrorResponse, habitResponseHeaders } from "@/shared/http/habit-response";
import { getHabitStats } from "@/features/habits/application/get-habit-stats";
import { isValidMonth } from "@/features/habits/domain/month";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

const invalidMonth = [{ field: "month", message: "Formato de mes inválido. Usar YYYY-MM" }];

/** HU-12/HU-14: streak (as of today) and completion of `month` (`YYYY-MM`, default the current UTC month). */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const query = new URL(request.url).searchParams;
    if ([...query.keys()].some((key) => key !== "month")) {
      return habitErrorResponse(habitValidationError, [{ field: "query", message: "Este endpoint solo admite el parámetro month" }]);
    }
    const months = query.getAll("month");
    if (months.length > 1 || (months.length === 1 && !isValidMonth(months[0]))) {
      return habitErrorResponse(habitValidationError, invalidMonth);
    }

    const { id } = await context.params;
    const result = await getHabitStats({ ownerId, habitId: id, month: months[0] }, habitRepository, new Date());
    if (!result.ok) return habitErrorResponse({ status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" });
    return NextResponse.json({ data: { habitId: result.habit.id, month: result.month, streak: result.streak, completion: result.completion } }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}
