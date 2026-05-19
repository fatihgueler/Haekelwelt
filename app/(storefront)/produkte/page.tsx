import type { Metadata } from 'next';
import Link from 'next/link';

import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';

export const metadata: Metadata = {
  title: 'Alle Produkte',
  description: 'Handgehäkelte Unikate aus unserer Werkstatt – Amigurumi, Heimdeko und mehr.',
};

export const revalidate = 300;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Shop</p>
        <h1 className="font-serif text-4xl tracking-tight">Alle Produkte</h1>
        <p className="text-muted-foreground">
          Jedes Stück wird von Hand gefertigt – Maschen sind kein Algorithmus.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Kategorien">
        <Link
          href="/produkte"
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Alle
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategorie/${cat.slug}`}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Noch keine Produkte – schau bald wieder vorbei.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                slug: product.slug,
                title: product.title,
                priceCents: product.priceCents,
                imageUrl: product.images[0]?.url,
                imageAlt: product.images[0]?.alt,
                blurDataUrl: product.images[0]?.blurDataUrl ?? undefined,
                categoryName: product.category.name,
                stock: product.stock,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
