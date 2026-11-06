import { z } from "zod";
import { habitFields, unitTooLongMessage } from "./create-habit-schema";

export const typeNotEditableMessage = "El tipo de un hábito no se puede modificar";
/** Warning shown when the new frequency removes days that already have logs (HU-07 CA-02). */
export const frequencyDaysRemovedMessage = "Los registros de ese día no serán eliminados";
export const emptyUpdateMessage = "Debes enviar al menos un campo para actualizar";

/**
 * Body of `PATCH /api/habits/:id` (HU-07): a partial update of name, unit and frequency.
 * The type is not editable. Whether `unit` fits the habit type is decided by the use case,
 * so `unit` may be null or empty here.
 */
export const forbiddenKeyMessage = "Campo no permitido";

const fieldsSchema = z.object({
  name: habitFields.name.optional(),
  frequency: habitFields.frequency.optional(),
  unit: z.union([z.string().trim().max(30, unitTooLongMessage), z.null()]).optional(),
  type: z.never({ error: typeNotEditableMessage }).optional(),
}).strict().refine((input) => Object.keys(input).length > 0, emptyUpdateMessage);

/** `JSON.parse` keeps `__proto__` as an own key, but object schemas skip it; reject it like any unknown key. */
export const updateHabitSchema = z.unknown().superRefine((input, ctx) => {
  if (typeof input === "object" && input !== null && Object.hasOwn(input, "__proto__")) {
    ctx.addIssue({ code: "custom", path: ["__proto__"], message: forbiddenKeyMessage });
  }
}).pipe(fieldsSchema);

export type UpdateHabitInput = Omit<z.infer<typeof fieldsSchema>, "type">;
