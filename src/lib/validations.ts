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
