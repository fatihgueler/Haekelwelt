import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';
import { getWishlistProductIds } from '@/lib/wishlist';
import { getCoreCategory } from '@/lib/category-theme';

type Params = { params: Promise<{ slug: string }> };

async function loadCategory(slug: string) {
  const fromDb = await db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (fromDb) return fromDb;

  // Kern-Kategorie ohne DB-Eintrag (z. B. frische Datenbank): Seite trotzdem
  // anzeigen – mit freundlichem Empty State statt 404.
  const core = getCoreCategory(slug);
  if (!core) return null;
  return {
    id: core.slug,
    slug: core.slug,
    name: core.name,
    description: core.description,
    products: [],
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await db.category.findUnique({ where: { slug } })) ?? getCoreCategory(slug);
  if (!cat) return { title: 'Kategorie nicht gefunden' };
  return {
    title: cat.name,
    description: cat.description ?? `Handgehäkeltes aus der Kategorie ${cat.name}.`,
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [category, wishlist] = await Promise.all([loadCategory(slug), getWishlistProductIds()]);
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
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-serif text-2xl sm:text-2xl">Hier wird gerade noch gehäkelt.</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            In dieser Kategorie ist im Moment nichts verfügbar. Schau dich doch in der ganzen
            Kollektion um – oder komm bald wieder vorbei.
          </p>
          <Link
            href="/produkte"
            className="mt-6 inline-flex font-medium text-primary underline-offset-4 hover:underline"
          >
            Zur ganzen Kollektion
          </Link>
        </div>
      ) : (
        <section aria-labelledby="category-products">
          <h2 id="category-products" className="sr-only">
            Produkte in {category.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  priceCents: product.priceCents,
                  imageUrl: product.images[0]?.url,
                  imageAlt: product.images[0]?.alt,
                  blurDataUrl: product.images[0]?.blurDataUrl ?? undefined,
                  categoryName: category.name,
                  stock: product.stock,
                  inWishlist: wishlist.has(product.id),
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
