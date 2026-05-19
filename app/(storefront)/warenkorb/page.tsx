import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartLineControls } from '@/components/storefront/cart-line-controls';
import { getCart } from '@/lib/cart';
import { priceCart } from '@/lib/pricing';
import { formatPriceCents } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Warenkorb',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/60" />
        <h1 className="font-serif text-3xl tracking-tight">Dein Warenkorb ist noch leer</h1>
        <p className="max-w-md text-muted-foreground">
          Stöbere durch unsere handgefertigten Stücke und finde etwas, das deinen Alltag schmückt.
        </p>
        <Button asChild size="lg">
          <Link href="/produkte">Zur Kollektion</Link>
        </Button>
      </div>
    );
  }

  const pricing = priceCart(
    items.map((i) => ({
      priceCents: i.product.priceCents,
      quantity: i.quantity,
      taxRate: i.product.taxRate,
    })),
    { countryCode: 'DE' },
  );

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight">Warenkorb</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} Position{items.length === 1 ? '' : 'en'} – die endgültige Adresse legst du
          beim Checkout fest.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:p-6"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32 sm:shrink-0">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 128px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/produkte/${item.product.slug}`}
                      className="font-serif text-lg leading-snug tracking-tight hover:text-primary"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPriceCents(item.product.priceCents)} / Stück
                    </p>
                  </div>
                  <p className="text-base font-semibold">
                    {formatPriceCents(item.product.priceCents * item.quantity)}
                  </p>
                </div>
                <CartLineControls
                  itemId={item.id}
                  quantity={item.quantity}
                  stock={item.product.stock}
                />
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl tracking-tight">Bestellübersicht</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Zwischensumme</dt>
                <dd>{formatPriceCents(pricing.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Versand DE</dt>
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

            {pricing.freeShippingMissingCents && pricing.freeShippingMissingCents > 0 ? (
              <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-xs text-foreground">
                Noch <strong>{formatPriceCents(pricing.freeShippingMissingCents)}</strong> bis zum
                Gratisversand in Deutschland.
              </p>
            ) : null}

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">Zur Kasse</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Versand innerhalb der EU. Auslandsversand wird beim Checkout berechnet.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
