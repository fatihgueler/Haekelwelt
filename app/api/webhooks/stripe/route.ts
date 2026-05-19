import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmation } from '@/lib/email/send-order-confirmation';
import { formatPriceCents, formatDateDE } from '@/lib/utils';
import { clearCart } from '@/lib/cart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unhandled(eventType: string) {
  return NextResponse.json({ received: true, ignored: eventType });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Stripe-Webhook nicht konfiguriert.' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      return NextResponse.json({ received: true });
    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object);
      return NextResponse.json({ received: true });
    default:
      return unhandled(event.type);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error('checkout.session.completed without orderId metadata', session.id);
    return;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) {
    console.error(`Order ${orderId} not found for stripe session ${session.id}`);
    return;
  }

  // Idempotenz
  if (order.status !== 'PENDING') return;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      },
    });
    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    if (order.discountCodeId) {
      await tx.discountCode.update({
        where: { id: order.discountCodeId },
        data: { redemptionCount: { increment: 1 } },
      });
    }
    if (order.userId) {
      const userCart = await tx.cart.findUnique({ where: { userId: order.userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        await tx.cart.update({
          where: { id: userCart.id },
          data: { appliedDiscountCode: null },
        });
      }
    }
  });

  // Versuche, Cart per cartToken/User zu leeren (best-effort, falls noch nicht in tx)
  try {
    if (order.userId) {
      const userCart = await db.cart.findUnique({ where: { userId: order.userId } });
      if (userCart) await clearCart(userCart.id);
    }
  } catch (e) {
    console.error('Cart cleanup failed', e);
  }

  // Bestätigungsmail (best-effort)
  try {
    const shipping = order.shippingSnapshot as {
      firstName: string;
      lastName: string;
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Häkelwelt';
    await sendOrderConfirmation(order.email, {
      customerName: order.user?.name ?? `${shipping.firstName} ${shipping.lastName}`,
      orderNumber: order.number,
      orderDate: formatDateDE(order.createdAt),
      items: order.items.map((i) => ({
        title: i.titleSnapshot,
        quantity: i.quantity,
        lineSubtotal: formatPriceCents(i.lineSubtotalCents),
      })),
      subtotal: formatPriceCents(order.subtotalCents),
      shipping: formatPriceCents(order.shippingCents),
      tax: formatPriceCents(order.taxCents),
      total: formatPriceCents(order.totalCents),
      shippingAddress: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        line1: shipping.line1,
        line2: shipping.line2,
        postalCode: shipping.postalCode,
        city: shipping.city,
        country: shipping.country,
      },
      siteUrl,
      siteName,
    });
  } catch (e) {
    console.error('Order confirmation mail failed', e);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await db.order.updateMany({
    where: { id: orderId, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });
}
