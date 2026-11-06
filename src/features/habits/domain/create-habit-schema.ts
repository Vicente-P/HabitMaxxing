import { z } from "zod";

export const unitRequiredMessage = "La unidad es obligatoria para hábitos numéricos";
export const unitTooLongMessage = "La unidad no puede superar 30 caracteres";

/** Validation shared by creation and edition (HU-06/HU-07). */
export const habitFields = {
  name: z.string({ error: "El nombre del hábito es obligatorio" }).trim()
    .min(1, "El nombre del hábito es obligatorio")
    .max(100, "El nombre no puede superar 100 caracteres"),
  frequency: z.array(z.number().int().min(0).max(6))
    .min(1, "Debes seleccionar al menos un día")
    .max(7, "Selecciona como máximo siete días")
    .refine((days) => new Set(days).size === days.length, "Los días no pueden repetirse")
    .transform((days) => [...days].sort((a, b) => a - b)),
};

export const createHabitSchema = z.discriminatedUnion("type", [
  z.object({ ...habitFields, type: z.literal("BINARY") }).strict(),
  z.object({
    ...habitFields,
    type: z.literal("NUMERIC"),
    unit: z.string({ error: unitRequiredMessage }).trim()
      .min(1, unitRequiredMessage)
      .max(30, unitTooLongMessage),
  }).strict(),
]);

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
