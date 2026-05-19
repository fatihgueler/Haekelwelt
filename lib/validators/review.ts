import { z } from 'zod';

const ratingSchema = z.coerce.number().int().min(1).max(5);

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: ratingSchema,
  title: z.string().trim().max(120, 'Maximal 120 Zeichen.').optional().or(z.literal('')),
  body: z.string().trim().min(20, 'Mindestens 20 Zeichen.').max(2000, 'Maximal 2000 Zeichen.'),
  imageUrls: z
    .array(z.string().url('Bitte gültige URL.'))
    .max(4, 'Maximal 4 Fotos pro Bewertung.')
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
