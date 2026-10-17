import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { checkHabitRequest, readHabitBody, habitInternalError, habitValidationError, type HabitRequestError } from "@/shared/http/habit-request";
import { habitErrorResponse, habitResponseHeaders } from "@/shared/http/habit-response";
import { setBinaryCompletion, type SetBinaryCompletionError } from "@/features/habits/application/set-binary-completion";
import { binaryLogSchema } from "@/features/habits/domain/binary-log-schema";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

const completionErrors: Record<SetBinaryCompletionError, HabitRequestError> = {
  NOT_FOUND: { status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" },
  FORBIDDEN: { status: 403, code: "FORBIDDEN", message: "No tienes permiso para registrar este hábito" },
  NUMERIC_NOT_SUPPORTED: { ...habitValidationError, message: "El registro de hábitos numéricos aún no está disponible" },
  FUTURE_DATE: { ...habitValidationError, message: "No se puede registrar en fechas futuras" },
  NOT_SCHEDULED: { ...habitValidationError, message: "Este hábito no está programado para este día" },
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitRequest(request, process.env.APP_ORIGIN);
    if (requestError) return habitErrorResponse(requestError);
    const body = await readHabitBody(request);
    if ("error" in body) return habitErrorResponse(body.error, body.error.status === 400 ? [] : undefined);
    const parsed = binaryLogSchema.safeParse(body.data);
    if (!parsed.success) {
      return habitErrorResponse(habitValidationError, parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ("keys" in issue ? issue.keys[0] : undefined) ?? "form"),
        message: issue.message,
      })));
    }

    const { id } = await context.params;
    const result = await setBinaryCompletion({ ownerId, habitId: id, completed: parsed.data.completed, date: parsed.data.date }, habitRepository);
    if (!result.ok) return habitErrorResponse(completionErrors[result.error]);
    return NextResponse.json({ data: result.log }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}
