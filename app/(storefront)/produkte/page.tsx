import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/storefront/shop-bits';
import { getCategoryTone, toneClasses } from '@/lib/category-theme';
import { cn } from '@/lib/utils';

import { Pagination } from '@/components/storefront/pagination';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductFilters } from '@/components/storefront/product-filters';
import { ProductSortSelect } from '@/components/storefront/product-sort';
import { SearchBar } from '@/components/storefront/search-bar';
import { db } from '@/lib/db';
import { getPriceRangeCents, listProducts, type ProductSort } from '@/lib/products';
import { getWishlistProductIds } from '@/lib/wishlist';

export const metadata: Metadata = {
  title: 'Alle Produkte',
  description:
    'Handgehäkelte Unikate aus der Werkstatt: Amigurumi, Heimdeko, Accessoires und Babysachen – mit Suche, Filtern und Sortierung.',
};

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function asInt(v: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(v) ? v[0] : v;
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function asSort(v: string | string[] | undefined): ProductSort {
  const raw = Array.isArray(v) ? v[0] : v;
  switch (raw) {
    case 'price_asc':
    case 'price_desc':
    case 'title_asc':
    case 'newest':
      return raw;
    default:
      return 'newest';
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim() : '';
  const categorySlugs = asArray(sp.cat);
  const minCents = asInt(sp.min);
  const maxCents = asInt(sp.max);
  const inStockOnly = sp.stock === '1';
  const sort = asSort(sp.sort);
  const page = asInt(sp.page) ?? 1;

  const [{ items, total, pageCount }, allCategories, priceRange, wishlist] = await Promise.all([
    listProducts({
      q,
      categorySlugs,
      minCents,
      maxCents,
      inStockOnly,
      sort,
      page,
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    getPriceRangeCents(),
    getWishlistProductIds(),
  ]);

  const filterCategories = allCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    count: c._count.products,
    tone: getCategoryTone(c.slug),
  }));

  const isFiltered = categorySlugs.length > 0 || Boolean(minCents || maxCents || inStockOnly);

  return (
    <div className="pb-16">
      <section className="bg-granny border-b border-border/60 bg-secondary/60">
        <div className="container py-10 lg:py-14">
          <p className="eyebrow">Shop</p>
          <h1 className="mt-2">{q ? `Suchergebnisse für „${q}“` : 'Alle Lieblingsstücke'}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {total === 0
              ? 'Für diese Auswahl haben wir gerade nichts auf der Nadel.'
              : `${total === 1 ? '1 handgehäkeltes Stück' : `${total} handgehäkelte Stücke`}${
                  isFiltered ? ' passen zu deiner Auswahl' : ' – jedes ein Unikat'
                }.`}
          </p>
          <nav aria-label="Kategorien" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {allCategories.map((c) => {
                const tone = getCategoryTone(c.slug);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/kategorie/${c.slug}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-transparent bg-card px-4 text-sm font-semibold shadow-soft transition-colors hover:border-primary"
                    >
                      <span
                        className={cn('h-2.5 w-2.5 rounded-full', toneClasses[tone].dot)}
                        aria-hidden
                      />
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <div className="container pt-8">
        <div className="mb-8 max-w-xl">
          <SearchBar variant="inline" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-12">
          <ProductFilters
            categories={filterCategories}
            priceMinCents={priceRange.min}
            priceMaxCents={priceRange.max}
            selectedCategories={categorySlugs}
            selectedMin={minCents}
            selectedMax={maxCents}
            inStockOnly={inStockOnly}
          />

          <section aria-labelledby="results-heading">
            <h2 id="results-heading" className="sr-only">
              Produkte
            </h2>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {total > 0 ? `Seite ${Math.min(page, pageCount)} von ${pageCount}` : null}
              </p>
              <ProductSortSelect value={sort} />
            </div>

            {items.length === 0 ? (
              <EmptyState
                title={q ? 'Dazu haben wir leider nichts gefunden.' : 'Hier ist gerade nichts.'}
                action={
                  <Button asChild variant="secondary">
                    <Link href="/produkte">Alle Filter zurücksetzen</Link>
                  </Button>
                }
              >
                Probier es mit weniger Filtern oder einem anderen Suchwort – oder stöbere einfach
                durch alle Stücke.
              </EmptyState>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                  {items.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      index={index}
                      priority={index < 2}
                      product={{
                        id: product.id,
                        slug: product.slug,
                        title: product.title,
                        priceCents: product.priceCents,
                        imageUrl: product.images[0]?.url,
                        imageAlt: product.images[0]?.alt,
                        blurDataUrl: product.images[0]?.blurDataUrl ?? undefined,
                        categoryName: product.category.name,
                        categorySlug: product.category.slug,
                        stock: product.stock,
                        inWishlist: wishlist.has(product.id),
                      }}
                    />
                  ))}
                </div>

                <Pagination
                  pathname="/produkte"
                  searchParams={sp}
                  page={page}
                  pageCount={pageCount}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
