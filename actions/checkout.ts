'use server';

import { randomInt } from 'node:crypto';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getCart } from '@/lib/cart';
import { resolveAppliedDiscount } from '@/lib/discount';
import { priceCart, priceLineTax, TAX_RATE_PERCENT } from '@/lib/pricing';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import { checkoutSchema, type CheckoutInput } from '@/lib/validators/address';

export type CheckoutActionResult =
  | { ok: true; url: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function buildOrderNumber() {
  const year = new Date().getFullYear();
  const rand = String(randomInt(0, 99999)).padStart(5, '0');
  return `HW-${year}-${rand}`;
}

export async function createCheckoutSessionAction(
  input: CheckoutInput,
): Promise<CheckoutActionResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Bitte alle Pflichtfelder korrekt ausfüllen.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const session = await auth();
  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return { ok: false, message: 'Dein Warenkorb ist leer.' };
  }

  // Stock-Recheck (Race-Schutz)
  for (const item of cart.items) {
    if (!item.product.isActive) {
      return { ok: false, message: `„${item.product.title}" ist nicht mehr verfügbar.` };
    }
    if (item.quantity > item.product.stock) {
      return {
        ok: false,
        message: `„${item.product.title}" ist nur noch ${item.product.stock} mal verfügbar.`,
      };
    }
  }

  const grossSubtotal = cart.items.reduce((s, i) => s + i.product.priceCents * i.quantity, 0);
  const applied = await resolveAppliedDiscount(cart.appliedDiscountCode, grossSubtotal);
  const pricing = priceCart(
    cart.items.map((i) => ({
      priceCents: i.product.priceCents,
      quantity: i.quantity,
      taxRate: i.product.taxRate,
    })),
    {
      countryCode: parsed.data.shipping.country,
      discountCents: applied?.discountCents,
    },
  );

  const billing = parsed.data.billingSameAsShipping
    ? parsed.data.shipping
    : (parsed.data.billing ?? parsed.data.shipping);

  const orderNumber = buildOrderNumber();

  // Rabatt proportional auf die Line-Items verteilen (Stripe akzeptiert keine
  // negativen Beträge). Snapshot in OrderItem behält Originalpreis – die
  // an Stripe übermittelten unit_amount-Werte sind aber bereits reduziert.
  const lineDiscounts = distributeDiscount(
    cart.items.map((i) => i.product.priceCents * i.quantity),
    pricing.discountCents,
  );

  const order = await db.order.create({
    data: {
      number: orderNumber,
      status: 'PENDING',
      userId: session?.user?.id,
      email: parsed.data.email,
      subtotalCents: pricing.subtotalCents,
      discountCents: pricing.discountCents,
      taxCents: pricing.taxCents,
      shippingCents: pricing.shippingCents,
      totalCents: pricing.totalCents,
      currency: 'EUR',
      shippingMethod:
        parsed.data.shipping.country === 'DE' ? 'DHL Paket Deutschland' : 'DHL Paket EU',
      taxNote: 'Preise inkl. der gesetzlichen deutschen MwSt. (§14 Abs. 4 UStG)',
      shippingSnapshot: parsed.data.shipping,
      billingSnapshot: billing,
      discountCodeId: applied?.code.id,
      discountCodeSnapshot: applied?.code.code,
      items: {
        create: cart.items.map((i) => {
          const lineSubtotal = i.product.priceCents * i.quantity;
          return {
            productId: i.productId,
            titleSnapshot: i.product.title,
            priceCentsSnapshot: i.product.priceCents,
            taxRateSnapshot: i.product.taxRate,
            quantity: i.quantity,
            lineSubtotalCents: lineSubtotal,
            lineTaxCents: priceLineTax(lineSubtotal, i.product.taxRate),
            imageUrlSnapshot: i.product.images[0]?.url ?? null,
          };
        }),
      },
    },
    include: { items: true },
  });

  // Stripe-Session: discounted unit_amount pro Line-Item.
  const lineItems = cart.items.map((cartItem, idx) => {
    const lineGross = cartItem.product.priceCents * cartItem.quantity;
    const lineDiscount = lineDiscounts[idx] ?? 0;
    const discountedLineCents = lineGross - lineDiscount;
    const unitAmount = Math.max(0, Math.round(discountedLineCents / cartItem.quantity));
    return {
      quantity: cartItem.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: unitAmount,
        tax_behavior: 'inclusive' as const,
        product_data: {
          name:
            applied && lineDiscount > 0
              ? `${cartItem.product.title} (Rabatt ${applied.code.code})`
              : cartItem.product.title,
          metadata: {
            productId: cartItem.productId,
            taxRate: `${TAX_RATE_PERCENT[cartItem.product.taxRate]}%`,
          },
        },
      },
    };
  });

  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: parsed.data.email,
    metadata: {
      orderId: order.id,
      orderNumber: order.number,
      discountCode: applied?.code.code ?? '',
    },
    locale: 'de',
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: pricing.shippingCents, currency: 'eur' },
          display_name:
            pricing.shippingCents === 0
              ? 'Versandkostenfrei'
              : parsed.data.shipping.country === 'DE'
                ? 'DHL Paket Deutschland'
                : 'DHL Paket EU',
          tax_behavior: 'inclusive',
        },
      },
    ],
    success_url: absoluteUrl(`/checkout/success?orderId=${order.id}`),
    cancel_url: absoluteUrl(`/checkout/cancel?orderId=${order.id}`),
  });

  if (!stripeSession.url) {
    return { ok: false, message: 'Stripe-Session konnte nicht erzeugt werden.' };
  }

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return { ok: true, url: stripeSession.url };
}

export async function createCheckoutAndRedirectAction(input: CheckoutInput) {
  const res = await createCheckoutSessionAction(input);
  if (!res.ok) return res;
  redirect(res.url);
}

/**
 * Verteilt einen Rabattbetrag proportional auf eine Liste von Brutto-Line-Items.
 * Garantiert: Summe der zurückgegebenen Cents-Beträge = totalDiscountCents.
 */
function distributeDiscount(lineGross: number[], totalDiscountCents: number): number[] {
  if (totalDiscountCents <= 0) return lineGross.map(() => 0);
  const grossSum = lineGross.reduce((s, v) => s + v, 0);
  if (grossSum <= 0) return lineGross.map(() => 0);

  const raw = lineGross.map((g) => (g * totalDiscountCents) / grossSum);
  const floored = raw.map((v) => Math.floor(v));
  let remainder = totalDiscountCents - floored.reduce((s, v) => s + v, 0);
  const remainders = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of remainders) {
    if (remainder <= 0) break;
    floored[i] = (floored[i] ?? 0) + 1;
    remainder -= 1;
  }
  return floored;
}
