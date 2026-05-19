import { z } from 'zod';
import { EU_COUNTRIES } from '@/lib/pricing';

const supportedCountries = z.enum(Array.from(EU_COUNTRIES) as [string, ...string[]], {
  errorMap: () => ({ message: 'Bitte ein EU-Land auswählen.' }),
});

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, 'Pflichtfeld.').max(60),
  lastName: z.string().trim().min(1, 'Pflichtfeld.').max(60),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  line1: z.string().trim().min(3, 'Bitte vollständige Straße + Hausnr.').max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('')),
  postalCode: z.string().trim().min(3, 'Pflichtfeld.').max(12),
  city: z.string().trim().min(2, 'Pflichtfeld.').max(80),
  country: supportedCountries,
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+0-9 ()\-/]*$/u, 'Nur Ziffern, Leerzeichen, +, (), -, /')
    .optional()
    .or(z.literal('')),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email('Gültige E-Mail bitte.'),
  shipping: addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billing: addressSchema.optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bitte AGB und Widerruf akzeptieren.' }),
  }),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
