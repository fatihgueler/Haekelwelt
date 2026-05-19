'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCart, getOrCreateCart } from '@/lib/cart';
import { validateDiscountCode } from '@/lib/discount';
import { priceCart } from '@/lib/pricing';

export type DiscountActionResult =
  | { ok: true; code: string; discountCents: number }
  | { ok: false; message: string };

const applyInput = z.object({ code: z.string().trim().min(1).max(32) });

export async function applyDiscountCodeAction(
  input: z.input<typeof applyInput>,
): Promise<DiscountActionResult> {
  const parsed = applyInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Bitte einen gültigen Code eingeben.' };

  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    return { ok: false, message: 'Dein Warenkorb ist leer.' };
  }

  const pricing = priceCart(
    cart.items.map((i) => ({
      priceCents: i.product.priceCents,
      quantity: i.quantity,
      taxRate: i.product.taxRate,
    })),
  );

  const validation = await validateDiscountCode(parsed.data.code, pricing.subtotalCents);
  if (!validation.ok) return { ok: false, message: validation.message };

  await db.cart.update({
    where: { id: cart.id },
    data: { appliedDiscountCode: validation.code.code },
  });

  revalidatePath('/warenkorb');
  revalidatePath('/checkout');
  return { ok: true, code: validation.code.code, discountCents: validation.discountCents };
}

export async function removeDiscountCodeAction(): Promise<DiscountActionResult> {
  const cart = await getCart();
  if (!cart) return { ok: false, message: 'Kein Warenkorb.' };

  await db.cart.update({
    where: { id: cart.id },
    data: { appliedDiscountCode: null },
  });

  revalidatePath('/warenkorb');
  revalidatePath('/checkout');
  return { ok: true, code: '', discountCents: 0 };
}
