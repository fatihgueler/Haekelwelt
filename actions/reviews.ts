'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { canUserReviewProduct } from '@/lib/reviews';
import { reviewSchema, type ReviewInput } from '@/lib/validators/review';

export type ReviewActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function submitReviewAction(input: ReviewInput): Promise<ReviewActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Bitte prüfe deine Eingaben.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: 'Bitte melde dich an, um eine Bewertung zu schreiben.' };
  }

  const eligibility = await canUserReviewProduct(session.user.id, parsed.data.productId);
  if (!eligibility.allowed) {
    if (eligibility.alreadyReviewed) {
      return { ok: false, message: 'Du hast dieses Produkt bereits bewertet.' };
    }
    return {
      ok: false,
      message: 'Bewertungen sind nur nach einer bestätigten Bestellung möglich.',
    };
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { slug: true },
  });
  if (!product) return { ok: false, message: 'Produkt nicht gefunden.' };

  await db.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      body: parsed.data.body,
      isVerified: eligibility.verified,
      images:
        parsed.data.imageUrls && parsed.data.imageUrls.length > 0
          ? {
              create: parsed.data.imageUrls.map((url) => ({ url, alt: null })),
            }
          : undefined,
    },
  });

  revalidatePath(`/produkte/${product.slug}`);
  return { ok: true };
}
