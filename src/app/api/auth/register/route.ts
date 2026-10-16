import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

const safeUserSelect = { id: true, email: true, name: true, createdAt: true, updatedAt: true } as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationResponse([]);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return validationResponse(parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? "form"), message: issue.message })));

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existing) return conflictResponse();

    const password = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { email: parsed.data.email, password, name: parsed.data.name },
      select: safeUserSelect,
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (isPrismaUniqueError(error)) return conflictResponse();
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } }, { status: 500 });
  }
}

function validationResponse(details: Array<{ field: string; message: string }>) {
  return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Datos de entrada inválidos", details } }, { status: 400 });
}

function conflictResponse() {
  return NextResponse.json({ error: { code: "CONFLICT", message: "No se pudo completar el registro con esos datos. Revisa la información e inténtalo de nuevo" } }, { status: 409 });
}

function isPrismaUniqueError(error: unknown): error is { code: "P2002" } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
