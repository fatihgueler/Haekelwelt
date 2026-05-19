import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'E-Mail ist zu kurz.')
  .max(254, 'E-Mail ist zu lang.')
  .email('Bitte eine gültige E-Mail eingeben.');

export const passwordSchema = z
  .string()
  .min(12, 'Mindestens 12 Zeichen.')
  .max(128, 'Maximal 128 Zeichen.')
  .refine((v) => /[a-z]/.test(v), 'Mindestens ein Kleinbuchstabe.')
  .refine((v) => /[A-Z]/.test(v), 'Mindestens ein Großbuchstabe.')
  .refine((v) => /[0-9]/.test(v), 'Mindestens eine Ziffer.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Passwort erforderlich.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Mindestens 2 Zeichen.').max(80),
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bitte AGB und Datenschutz akzeptieren.' }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;
