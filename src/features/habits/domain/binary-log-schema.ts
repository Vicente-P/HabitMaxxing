import { z } from "zod";
import { isValidCalendarDate } from "./calendar-date";

const dateField = z.string({ error: "La fecha debe tener formato YYYY-MM-DD válido" })
  .refine(isValidCalendarDate, "La fecha debe tener formato YYYY-MM-DD válido")
  .optional();

/** Body of `POST /api/habits/:id/logs` for binary habits. */
export const binaryLogSchema = z.object({
  date: dateField,
  completed: z.boolean({ error: "El campo completed debe ser un booleano" }),
}).strict();

export const positiveValueMessage = "El valor debe ser mayor a 0";

/** Body of `POST /api/habits/:id/logs` for numeric habits. */
export const numericLogSchema = z.object({
  date: dateField,
  value: z.number({ error: "El campo value debe ser un número" })
    .refine((value) => Number.isFinite(value) && value > 0, positiveValueMessage),
}).strict();

export type BinaryLogInput = z.infer<typeof binaryLogSchema>;
export type NumericLogInput = z.infer<typeof numericLogSchema>;

export type LogBody =
  | { kind: "binary"; data: BinaryLogInput }
  | { kind: "numeric"; data: NumericLogInput };

export type LogBodyResult =
  | { success: true; body: LogBody }
  | { success: false; issues: Array<{ field: string; message: string }> };

function toIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: String(issue.path[0] ?? ("keys" in issue ? issue.keys[0] : undefined) ?? "form"),
    message: issue.message,
  }));
}

/**
 * Parses a log body by its shape: a `value` key without `completed` selects the numeric schema,
 * anything else the binary one. Whether the shape fits the habit type is decided by the use cases.
 */
export function parseLogBody(input: unknown): LogBodyResult {
  const numeric = typeof input === "object" && input !== null && !Array.isArray(input) && "value" in input && !("completed" in input);
  if (numeric) {
    const parsed = numericLogSchema.safeParse(input);
    return parsed.success ? { success: true, body: { kind: "numeric", data: parsed.data } } : { success: false, issues: toIssues(parsed.error) };
  }
  const parsed = binaryLogSchema.safeParse(input);
  return parsed.success ? { success: true, body: { kind: "binary", data: parsed.data } } : { success: false, issues: toIssues(parsed.error) };
}
