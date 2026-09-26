import type { Metadata } from 'next';
import { SmartImage as Image } from '@/components/shared/smart-image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { getCart } from '@/lib/cart';
import { resolveAppliedDiscount } from '@/lib/discount';
import { priceCart } from '@/lib/pricing';
import { formatPriceCents } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CheckoutForm } from '@/components/storefront/checkout-form';
import { DiscountInput } from '@/components/storefront/discount-input';
import { TrustList } from '@/components/storefront/shop-bits';

export const metadata: Metadata = {
  title: 'Kasse',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const [session, cart] = await Promise.all([auth(), getCart()]);
  if (!cart || cart.items.length === 0) redirect('/warenkorb');

  const baseLines = cart.items.map((i) => ({
    priceCents: i.product.priceCents,
    quantity: i.quantity,
    taxRate: i.product.taxRate,
  }));
  const grossSubtotal = baseLines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const applied = await resolveAppliedDiscount(cart.appliedDiscountCode, grossSubtotal);
  const pricing = priceCart(baseLines, {
    countryCode: 'DE',
    discountCents: applied?.discountCents,
  });

  return (
    <div className="container py-10 lg:py-16">
      <header className="mb-8 space-y-2">
        <p className="eyebrow">Letzter Schritt</p>
        <h1>Kasse</h1>
        <p className="text-muted-foreground">
          Du bestellst als{' '}
          {session?.user ? <strong>{session.user.email}</strong> : <strong>Gast</strong>}. Du kannst{' '}
          <Link
            href="/login?next=/checkout"
            className="font-medium text-primary underline underline-offset-4"
          >
            einloggen
          </Link>
          , um deine Daten zu nutzen.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <CheckoutForm defaultEmail={session?.user?.email ?? ''} />

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-serif text-2xl sm:text-2xl">Deine Bestellung</h2>
            <ul className="mt-4 space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{item.product.title}</span>
                    <span className="text-xs text-muted-foreground">Menge: {item.quantity}</span>
                    <span className="mt-auto text-sm">
                      {formatPriceCents(item.product.priceCents * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Separator className="my-6" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Zwischensumme</dt>
                <dd>{formatPriceCents(pricing.subtotalCents)}</dd>
              </div>
              {pricing.discountCents > 0 ? (
                <div className="flex justify-between font-medium text-success">
                  <dt>Rabatt ({applied?.code.code})</dt>
                  <dd>−{formatPriceCents(pricing.discountCents)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Versand (Standardannahme DE)</dt>
                <dd>
                  {pricing.shippingCents === 0 ? 'Gratis' : formatPriceCents(pricing.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>davon MwSt.</dt>
                <dd>{formatPriceCents(pricing.taxCents)}</dd>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <dt>Gesamt</dt>
                <dd>{formatPriceCents(pricing.totalCents)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <DiscountInput appliedCode={applied?.code.code ?? null} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Die finalen Versandkosten werden nach Auswahl des Lieferlandes berechnet.
            </p>
          </div>
          <TrustList compact className="rounded-3xl bg-secondary p-6" />
        </aside>
      </div>
    </div>
  );
}
