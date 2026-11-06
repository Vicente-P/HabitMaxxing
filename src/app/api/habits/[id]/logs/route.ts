import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { checkHabitRequest, readHabitBody, habitInternalError, habitValidationError, type HabitRequestError } from "@/shared/http/habit-request";
import { habitErrorResponse, habitResponseHeaders } from "@/shared/http/habit-response";
import { getHabitMonthDays } from "@/features/habits/application/get-habit-month-days";
import { setBinaryCompletion } from "@/features/habits/application/set-binary-completion";
import { setNumericValue } from "@/features/habits/application/set-numeric-value";
import type { LoggableHabitError } from "@/features/habits/application/resolve-loggable-habit";
import { isValidMonth } from "@/features/habits/domain/month";
import { parseLogBody } from "@/features/habits/domain/binary-log-schema";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

const completionErrors: Record<Exclude<LoggableHabitError, "TYPE_MISMATCH">, HabitRequestError> = {
  NOT_FOUND: { status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" },
  FUTURE_DATE: { ...habitValidationError, message: "No se puede registrar en fechas futuras" },
  NOT_SCHEDULED: { ...habitValidationError, message: "Este hábito no está programado para este día" },
};

const invalidMonth = [{ field: "month", message: "Formato de mes inválido. Usar YYYY-MM" }];

/** HU-13: status of every day of `month` (required, `YYYY-MM`, UTC) for the owner's habit. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const query = new URL(request.url).searchParams;
    if ([...query.keys()].some((key) => key !== "month")) {
      return habitErrorResponse(habitValidationError, [{ field: "query", message: "Este endpoint solo admite el parámetro month" }]);
    }
    const months = query.getAll("month");
    if (months.length !== 1 || !isValidMonth(months[0])) return habitErrorResponse(habitValidationError, invalidMonth);

    const { id } = await context.params;
    const result = await getHabitMonthDays({ ownerId, habitId: id, month: months[0] }, habitRepository, new Date());
    if (!result.ok) return habitErrorResponse({ status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" });
    return NextResponse.json({ data: { habitId: result.habit.id, month: result.month, days: result.days } }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitRequest(request, process.env.APP_ORIGIN);
    if (requestError) return habitErrorResponse(requestError);
    const body = await readHabitBody(request);
    if ("error" in body) return habitErrorResponse(body.error, body.error.status === 400 ? [] : undefined);
    const parsed = parseLogBody(body.data);
    if (!parsed.success) return habitErrorResponse(habitValidationError, parsed.issues);

    const { id } = await context.params;
    const { body: log } = parsed;
    const result = log.kind === "numeric"
      ? await setNumericValue({ ownerId, habitId: id, value: log.data.value, date: log.data.date }, habitRepository)
      : await setBinaryCompletion({ ownerId, habitId: id, completed: log.data.completed, date: log.data.date }, habitRepository);
    if (!result.ok) {
      // The body shape does not fit the habit type: point at the field the habit actually needs.
      if (result.error === "TYPE_MISMATCH") {
        return habitErrorResponse(habitValidationError, [log.kind === "numeric"
          ? { field: "completed", message: "Este hábito requiere el campo completed" }
          : { field: "value", message: "Este hábito requiere un valor numérico" }]);
      }
      return habitErrorResponse(completionErrors[result.error]);
    }
    return NextResponse.json({ data: result.log }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}
