'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  addToCart as addToCartLib,
  removeCartItem as removeCartItemLib,
  setCartItemQuantity as setCartItemQuantityLib,
} from '@/lib/cart';

const addInput = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

const setQuantityInput = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(20),
});

const removeInput = z.object({ itemId: z.string().min(1) });

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function addToCartAction(input: z.input<typeof addInput>): Promise<ActionResult> {
  const parsed = addInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Ungültige Eingabe.' };

  try {
    await addToCartLib(parsed.data.productId, parsed.data.quantity);
    revalidatePath('/warenkorb');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler.' };
  }
}

export async function setCartItemQuantityAction(
  input: z.input<typeof setQuantityInput>,
): Promise<ActionResult> {
  const parsed = setQuantityInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Ungültige Eingabe.' };

  try {
    await setCartItemQuantityLib(parsed.data.itemId, parsed.data.quantity);
    revalidatePath('/warenkorb');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler.' };
  }
}

export async function removeCartItemAction(
  input: z.input<typeof removeInput>,
): Promise<ActionResult> {
  const parsed = removeInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Ungültige Eingabe.' };

  try {
    await removeCartItemLib(parsed.data.itemId);
    revalidatePath('/warenkorb');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler.' };
  }
}
