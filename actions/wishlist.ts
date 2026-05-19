'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';

const input = z.object({ productId: z.string().min(1) });

export type WishlistActionResult =
  | { ok: true; inWishlist: boolean }
  | { ok: false; error: string; requiresAuth?: boolean };

export async function toggleWishlistAction(
  raw: z.input<typeof input>,
): Promise<WishlistActionResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Ungültige Eingabe.' };

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: 'Bitte melde dich an, um Artikel zu merken.', requiresAuth: true };
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, isActive: true },
  });
  if (!product || !product.isActive) {
    return { ok: false, error: 'Produkt nicht verfügbar.' };
  }

  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId: parsed.data.productId },
    },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath('/konto/wunschliste');
    return { ok: true, inWishlist: false };
  }

  await db.wishlistItem.create({
    data: { userId: session.user.id, productId: parsed.data.productId },
  });
  revalidatePath('/konto/wunschliste');
  return { ok: true, inWishlist: true };
}
