import { NextResponse } from "next/server";
import type { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserLookup, requireHabitOwner } from "@/features/auth";
import { checkHabitOrigin, checkHabitRequest, readHabitBody, habitInternalError, habitValidationError } from "@/shared/http/habit-request";
import { habitErrorResponse, habitResponseHeaders } from "@/shared/http/habit-response";
import { updateHabit, type UpdateHabitError } from "@/features/habits/application/update-habit";
import { unitRequiredMessage } from "@/features/habits/domain/create-habit-schema";
import { frequencyDaysRemovedMessage, updateHabitSchema } from "@/features/habits/domain/update-habit-schema";
import { createPrismaHabitRepository } from "@/features/habits/infrastructure/prisma-habit-repository";

const habitRepository = createPrismaHabitRepository(prisma);
const userLookup = createPrismaUserLookup(prisma);

const unitDetails: Record<Exclude<UpdateHabitError, "NOT_FOUND">, { field: string; message: string }> = {
  UNIT_NOT_ALLOWED: { field: "unit", message: "Los hábitos binarios no tienen unidad" },
  UNIT_REQUIRED: { field: "unit", message: unitRequiredMessage },
};

function toDetails(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: String(issue.path[0] ?? ("keys" in issue ? issue.keys[0] : undefined) ?? "form"),
    message: issue.message,
  }));
}

/** HU-08: permanently deletes the owner's habit and its logs. A foreign habit looks like a missing one. */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitOrigin(request, process.env.APP_ORIGIN);
    if (requestError) return habitErrorResponse(requestError);

    const { id } = await context.params;
    const deleted = await habitRepository.delete(id, ownerId);
    if (!deleted) return habitErrorResponse({ status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" });
    return NextResponse.json({ data: { message: "Hábito eliminado exitosamente", id } }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await requireHabitOwner(await auth(), userLookup);
    if (!ownerId) return habitErrorResponse({ status: 401, code: "UNAUTHORIZED", message: "Debes iniciar sesión para acceder a este recurso" });

    const requestError = checkHabitRequest(request, process.env.APP_ORIGIN);
    if (requestError) return habitErrorResponse(requestError);
    const body = await readHabitBody(request);
    if ("error" in body) return habitErrorResponse(body.error, body.error.status === 400 ? [] : undefined);
    const parsed = updateHabitSchema.safeParse(body.data);
    if (!parsed.success) return habitErrorResponse(habitValidationError, toDetails(parsed.error));

    const { id } = await context.params;
    const result = await updateHabit({ ownerId, habitId: id, changes: parsed.data }, habitRepository);
    if (!result.ok) {
      if (result.error === "NOT_FOUND") return habitErrorResponse({ status: 404, code: "NOT_FOUND", message: "Hábito no encontrado" });
      return habitErrorResponse(habitValidationError, [unitDetails[result.error]]);
    }
    const warnings = result.removedDaysWithLogs.length > 0
      ? { warnings: [{ code: "FREQUENCY_DAYS_REMOVED", message: frequencyDaysRemovedMessage, removedDays: result.removedDaysWithLogs }] }
      : {};
    return NextResponse.json({ data: result.habit, ...warnings }, { status: 200, headers: habitResponseHeaders });
  } catch {
    return habitErrorResponse(habitInternalError);
  }
}
