import { z } from 'zod';
import { emailSchema } from './auth';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Mindestens 2 Zeichen.').max(80),
  email: emailSchema,
  subject: z.string().trim().min(3, 'Mindestens 3 Zeichen.').max(120),
  body: z.string().trim().min(20, 'Mindestens 20 Zeichen.').max(4000),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Bitte Datenschutz akzeptieren.' }),
  }),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
