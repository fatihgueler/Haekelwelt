import 'server-only';
import type { DiscountCode } from '@prisma/client';
import { db } from '@/lib/db';

export type DiscountValidation =
  | {
      ok: true;
      code: DiscountCode;
      discountCents: number;
    }
  | {
      ok: false;
      reason:
        | 'unknown'
        | 'inactive'
        | 'expired'
        | 'not_yet_valid'
        | 'min_subtotal'
        | 'max_redemptions';
      message: string;
    };

export async function validateDiscountCode(
  rawCode: string,
  subtotalCents: number,
): Promise<DiscountValidation> {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, reason: 'unknown', message: 'Bitte Code eingeben.' };
  }

  const code = await db.discountCode.findUnique({ where: { code: normalized } });
  if (!code) {
    return { ok: false, reason: 'unknown', message: 'Code ist nicht gültig.' };
  }
  if (!code.isActive) {
    return { ok: false, reason: 'inactive', message: 'Code ist nicht mehr aktiv.' };
  }

  const now = new Date();
  if (code.validFrom && code.validFrom > now) {
    return { ok: false, reason: 'not_yet_valid', message: 'Code ist noch nicht gültig.' };
  }
  if (code.validUntil && code.validUntil < now) {
    return { ok: false, reason: 'expired', message: 'Code ist abgelaufen.' };
  }
  if (subtotalCents < code.minSubtotalCents) {
    return {
      ok: false,
      reason: 'min_subtotal',
      message: `Der Mindestbestellwert für diesen Code beträgt ${(code.minSubtotalCents / 100).toFixed(2).replace('.', ',')} €.`,
    };
  }
  if (code.maxRedemptions !== null && code.redemptionCount >= code.maxRedemptions) {
    return {
      ok: false,
      reason: 'max_redemptions',
      message: 'Dieser Code wurde bereits zu oft eingelöst.',
    };
  }

  const discountCents = computeDiscountCents(code, subtotalCents);

  return { ok: true, code, discountCents };
}

export function computeDiscountCents(code: DiscountCode, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (code.type === 'PERCENT') {
    return Math.min(subtotalCents, Math.round((subtotalCents * code.value) / 100));
  }
  // FIXED
  return Math.min(subtotalCents, code.value);
}

/**
 * Liest den am Cart hinterlegten Code (falls vorhanden) und prüft ihn neu.
 * Gibt `null` zurück, wenn kein Code hinterlegt ist oder er nicht mehr gilt.
 */
export async function resolveAppliedDiscount(
  appliedCode: string | null,
  subtotalCents: number,
): Promise<{ code: DiscountCode; discountCents: number } | null> {
  if (!appliedCode) return null;
  const v = await validateDiscountCode(appliedCode, subtotalCents);
  if (!v.ok) return null;
  return { code: v.code, discountCents: v.discountCents };
}
