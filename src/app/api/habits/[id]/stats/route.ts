import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { habitInternalError, habitValidationError } from "@/shared/http/habit-request";
import { habitErrorResponse, habitResponseHeaders } from "@/shared/http/habit-response";
import { getHabitStreak } from "@/features/habits/application/get-habit-streak";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

/** HU-12: streak only for now; `month` and `completion` arrive with HU-14, so no query parameter is accepted yet. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    if (new URL(request.url).searchParams.size > 0) {
      return habitErrorResponse(habitValidationError, [{ field: "query", message: "Este endpoint no admite parámetros" }]);
    }

    const { id } = await context.params;
    const result = await getHabitStreak({ ownerId, habitId: id }, habitRepository, new Date());
    if (!result.ok) return habitErrorResponse({ status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" });
    return NextResponse.json({ data: { habitId: result.habit.id, streak: result.streak } }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}
