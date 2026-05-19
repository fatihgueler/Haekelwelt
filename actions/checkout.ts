'use server';

import { randomInt } from 'node:crypto';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getCart } from '@/lib/cart';
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

  const pricing = priceCart(
    cart.items.map((i) => ({
      priceCents: i.product.priceCents,
      quantity: i.quantity,
      taxRate: i.product.taxRate,
    })),
    { countryCode: parsed.data.shipping.country },
  );

  const billing = parsed.data.billingSameAsShipping
    ? parsed.data.shipping
    : (parsed.data.billing ?? parsed.data.shipping);

  const orderNumber = buildOrderNumber();

  const order = await db.order.create({
    data: {
      number: orderNumber,
      status: 'PENDING',
      userId: session?.user?.id,
      email: parsed.data.email,
      subtotalCents: pricing.subtotalCents,
      taxCents: pricing.taxCents,
      shippingCents: pricing.shippingCents,
      totalCents: pricing.totalCents,
      currency: 'EUR',
      shippingMethod:
        parsed.data.shipping.country === 'DE' ? 'DHL Paket Deutschland' : 'DHL Paket EU',
      taxNote: 'Preise inkl. der gesetzlichen deutschen MwSt. (§14 Abs. 4 UStG)',
      shippingSnapshot: parsed.data.shipping,
      billingSnapshot: billing,
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

  // Stripe-Session
  const lineItems: Array<{
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      tax_behavior: 'inclusive';
      product_data: { name: string; metadata: { productId: string | null; taxRate: string } };
    };
  }> = order.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'eur',
      unit_amount: item.priceCentsSnapshot,
      tax_behavior: 'inclusive',
      product_data: {
        name: item.titleSnapshot,
        metadata: {
          productId: item.productId,
          taxRate: `${TAX_RATE_PERCENT[item.taxRateSnapshot]}%`,
        },
      },
    },
  }));

  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: parsed.data.email,
    metadata: { orderId: order.id, orderNumber: order.number },
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
