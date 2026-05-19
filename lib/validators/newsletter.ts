import { z } from 'zod';
import { emailSchema } from './auth';

export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Bitte Datenschutz akzeptieren.' }),
  }),
  // Honeypot – darf nicht gesetzt werden
  website: z.string().max(0).optional().or(z.literal('')),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
