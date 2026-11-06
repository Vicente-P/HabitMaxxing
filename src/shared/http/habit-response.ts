import { NextResponse } from "next/server";
import type { HabitRequestError } from "./habit-request";

export const habitResponseHeaders = { "Cache-Control": "private, no-store" };

export function habitErrorResponse(error: HabitRequestError, details?: Array<{ field: string; message: string }>) {
  return NextResponse.json(
    { error: { code: error.code, message: error.message, ...(details ? { details } : {}) } },
    { status: error.status, headers: habitResponseHeaders },
  );
}
