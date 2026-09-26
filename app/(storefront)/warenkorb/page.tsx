import type { Metadata } from 'next';
import { SmartImage as Image } from '@/components/shared/smart-image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartLineControls } from '@/components/storefront/cart-line-controls';
import { DiscountInput } from '@/components/storefront/discount-input';
import { EmptyState, FreeShippingMeter, TrustList } from '@/components/storefront/shop-bits';
import { getCategoryTone, toneClasses } from '@/lib/category-theme';
import { getCart } from '@/lib/cart';
import { resolveAppliedDiscount } from '@/lib/discount';
import { priceCart } from '@/lib/pricing';
import { cn, formatPriceCents } from '@/lib/utils';

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
      <div className="container py-12 lg:py-20">
        <EmptyState
          headingLevel="h1"
          title="Dein Warenkorb ist noch leer"
          className="mx-auto max-w-2xl"
          action={
            <>
              <Button asChild size="lg">
                <Link href="/produkte">Kollektion entdecken</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/konto/wunschliste" prefetch={false}>
                  Zur Wunschliste
                </Link>
              </Button>
            </>
          }
        >
          Stöbere durch die handgehäkelten Stücke und finde etwas, das deinen Alltag schöner macht.
        </EmptyState>
      </div>
    );
  }

  const baseLines = items.map((i) => ({
    priceCents: i.product.priceCents,
    quantity: i.quantity,
    taxRate: i.product.taxRate,
  }));
  const grossSubtotal = baseLines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const applied = await resolveAppliedDiscount(cart?.appliedDiscountCode ?? null, grossSubtotal);
  const pricing = priceCart(baseLines, {
    countryCode: 'DE',
    discountCents: applied?.discountCents,
  });

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-8">
        <p className="eyebrow">Fast geschafft</p>
        <h1 className="mt-2">Dein Warenkorb</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length === 1 ? '1 Lieblingsstück' : `${items.length} Lieblingsstücke`} – die
          Lieferadresse gibst du im nächsten Schritt an.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5"
            >
              <div
                className={cn(
                  'relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-2xl sm:w-28',
                  toneClasses[getCategoryTone(item.product.category.slug)].surface,
                )}
              >
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/produkte/${item.product.slug}`}
                      className="font-serif text-lg font-semibold leading-snug tracking-tight hover:text-primary"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPriceCents(item.product.priceCents)} / Stück
                    </p>
                  </div>
                  <p className="text-base font-semibold tabular-nums">
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
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-serif text-2xl sm:text-2xl">Bestellübersicht</h2>
            <FreeShippingMeter subtotalCents={pricing.subtotalCents} className="mt-4" />
            <dl className="mt-4 space-y-2 text-sm">
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

            <div className="mt-4">
              <DiscountInput appliedCode={applied?.code.code ?? null} />
            </div>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">Zur Kasse</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Versand innerhalb der EU. Auslandsversand wird beim Checkout berechnet.
            </p>
          </div>
          <TrustList compact className="rounded-3xl bg-secondary p-6" />
        </aside>
      </div>
    </div>
  );
}
