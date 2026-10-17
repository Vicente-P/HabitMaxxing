import { z } from "zod";
import { isValidCalendarDate } from "./calendar-date";

/** Body of `POST /api/habits/:id/logs` for binary habits. Numeric `value` is not accepted yet (HU-11). */
export const binaryLogSchema = z.object({
  date: z.string({ error: "La fecha debe tener formato YYYY-MM-DD válido" })
    .refine(isValidCalendarDate, "La fecha debe tener formato YYYY-MM-DD válido")
    .optional(),
  completed: z.boolean({ error: "El campo completed debe ser un booleano" }),
}).strict();

export type BinaryLogInput = z.infer<typeof binaryLogSchema>;
