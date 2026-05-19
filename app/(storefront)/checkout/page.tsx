import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { getCart } from '@/lib/cart';
import { priceCart } from '@/lib/pricing';
import { formatPriceCents } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CheckoutForm } from '@/components/storefront/checkout-form';

export const metadata: Metadata = {
  title: 'Kasse',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const [session, cart] = await Promise.all([auth(), getCart()]);
  if (!cart || cart.items.length === 0) redirect('/warenkorb');

  const pricing = priceCart(
    cart.items.map((i) => ({
      priceCents: i.product.priceCents,
      quantity: i.quantity,
      taxRate: i.product.taxRate,
    })),
    { countryCode: 'DE' },
  );

  return (
    <div className="container py-10 lg:py-16">
      <header className="mb-8 space-y-1">
        <h1 className="font-serif text-4xl tracking-tight">Kasse</h1>
        <p className="text-muted-foreground">
          Du bestellst als{' '}
          {session?.user ? <strong>{session.user.email}</strong> : <strong>Gast</strong>}. Du kannst{' '}
          <Link href="/login?next=/checkout" className="underline-offset-2 hover:underline">
            einloggen
          </Link>
          , um deine Daten zu nutzen.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <CheckoutForm defaultEmail={session?.user?.email ?? ''} />

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl tracking-tight">Deine Bestellung</h2>
            <ul className="mt-4 space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.images[0].alt}
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
            <p className="mt-4 text-xs text-muted-foreground">
              Die finalen Versandkosten werden nach Auswahl des Lieferlandes berechnet.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
