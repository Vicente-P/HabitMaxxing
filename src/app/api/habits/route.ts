import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHabitSchema } from "@/lib/validations";
import { createHabit, listHabitCatalog, requireHabitOwner } from "@/lib/habits";
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
    if (params.size !== 1 || params.get("view") !== "catalog") {
      return errorResponse(habitValidationError, [{ field: "view", message: "Se requiere únicamente view=catalog" }]);
    }

    const habits = await listHabitCatalog(ownerId, prisma);
    return NextResponse.json({ data: habits }, { status: 200, headers: responseHeaders });
  } catch {
    return errorResponse(habitInternalError);
  }
}
