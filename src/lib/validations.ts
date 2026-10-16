import { z } from "zod";

const passwordMaxBytes = 72;

export const registerSchema = z.object({
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido")
    .max(254, "El correo electrónico es demasiado largo"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .refine(
      (value) => new TextEncoder().encode(value).length <= passwordMaxBytes,
      "La contraseña no puede superar 72 bytes UTF-8",
    ),
  name: z
    .string()
    .trim()
    .max(100, "El nombre no puede superar 100 caracteres")
    .transform((value) => value || null)
    .nullable()
    .optional()
    .default(null),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

const habitFields = {
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
    unit: z.string({ error: "La unidad es obligatoria para hábitos numéricos" }).trim()
      .min(1, "La unidad es obligatoria para hábitos numéricos")
      .max(30, "La unidad no puede superar 30 caracteres"),
  }).strict(),
]);

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
