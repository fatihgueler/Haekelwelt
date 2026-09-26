import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/storefront/shop-bits';
import { getWishlist } from '@/lib/wishlist';

export const metadata: Metadata = {
  title: 'Wunschliste',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function WunschlistePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?next=/konto/wunschliste');

  const items = await getWishlist();

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Mein Konto</p>
          <h1 className="mt-2">Wunschliste</h1>
          <p className="mt-2 text-muted-foreground">
            {items.length === 0
              ? 'Du hast noch nichts gemerkt.'
              : `${items.length} ${items.length === 1 ? 'Lieblingsstück' : 'Lieblingsstücke'} auf deiner Liste.`}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/konto">Zurück zum Konto</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Noch ganz leer hier."
          wools={['himbeere', 'lavendel', 'pfirsich']}
          action={
            <Button asChild>
              <Link href="/produkte">Kollektion entdecken</Link>
            </Button>
          }
        >
          Klick einfach auf das Herz an einem Stück, das dir gefällt – es wartet dann hier auf dich.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <ProductCard
              key={item.id}
              index={index}
              product={{
                id: item.productId,
                slug: item.product.slug,
                title: item.product.title,
                priceCents: item.product.priceCents,
                imageUrl: item.product.images[0]?.url,
                imageAlt: item.product.images[0]?.alt,
                blurDataUrl: item.product.images[0]?.blurDataUrl ?? undefined,
                categoryName: item.product.category.name,
                categorySlug: item.product.category.slug,
                stock: item.product.stock,
                inWishlist: true,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
