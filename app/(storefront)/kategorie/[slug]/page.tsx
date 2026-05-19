import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';

type Params = { params: Promise<{ slug: string }> };

async function loadCategory(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return { title: 'Kategorie nicht gefunden' };
  return {
    title: cat.name,
    description: cat.description ?? `Handgehäkeltes aus der Kategorie ${cat.name}.`,
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) notFound();

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <Link href="/produkte" className="text-sm font-medium uppercase tracking-wide text-primary">
          ← Alle Kategorien
        </Link>
        <h1 className="font-serif text-4xl tracking-tight">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground">{category.description}</p>
        ) : null}
      </header>

      {category.products.length === 0 ? (
        <p className="text-muted-foreground">
          Aktuell sind keine Produkte in dieser Kategorie verfügbar.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                slug: product.slug,
                title: product.title,
                priceCents: product.priceCents,
                imageUrl: product.images[0]?.url,
                imageAlt: product.images[0]?.alt,
                blurDataUrl: product.images[0]?.blurDataUrl ?? undefined,
                categoryName: category.name,
                stock: product.stock,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
