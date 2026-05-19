import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';

import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/storefront/product-card';
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
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Mein Konto</p>
          <h1 className="font-serif text-4xl tracking-tight">Wunschliste</h1>
          <p className="text-muted-foreground">
            {items.length === 0
              ? 'Du hast noch nichts gemerkt.'
              : `${items.length} ${items.length === 1 ? 'Artikel' : 'Artikel'} auf deiner Liste.`}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/konto">Zurück zum Konto</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground/60" />
          <p className="max-w-md text-muted-foreground">
            Klick einfach auf das Herz an einem Produkt, das dir gefällt. Es landet sicher hier.
          </p>
          <Button asChild>
            <Link href="/produkte">Zur Kollektion</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.productId,
                slug: item.product.slug,
                title: item.product.title,
                priceCents: item.product.priceCents,
                imageUrl: item.product.images[0]?.url,
                imageAlt: item.product.images[0]?.alt,
                blurDataUrl: item.product.images[0]?.blurDataUrl ?? undefined,
                categoryName: item.product.category.name,
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
