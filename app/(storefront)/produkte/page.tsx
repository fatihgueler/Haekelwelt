import type { Metadata } from 'next';

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
  description: 'Handgehäkelte Unikate aus unserer Werkstatt – mit Filtern, Suche und Sortierung.',
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
  }));

  return (
    <div className="container py-10 lg:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Shop</p>
        <h1 className="font-serif text-4xl tracking-tight">
          {q ? `Suchergebnisse für „${q}"` : 'Alle Produkte'}
        </h1>
        <p className="text-muted-foreground">
          {total === 0
            ? 'Keine Treffer für die aktuelle Auswahl.'
            : total === 1
              ? '1 Produkt'
              : `${total} Produkte`}
          {categorySlugs.length > 0 || minCents || maxCents || inStockOnly ? ' (gefiltert)' : null}
        </p>
      </header>

      <div className="mb-6">
        <SearchBar variant="inline" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        <ProductFilters
          categories={filterCategories}
          priceMinCents={priceRange.min}
          priceMaxCents={priceRange.max}
          selectedCategories={categorySlugs}
          selectedMin={minCents}
          selectedMax={maxCents}
          inStockOnly={inStockOnly}
        />

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Seite {Math.min(page, pageCount)} von {pageCount}
            </p>
            <ProductSortSelect value={sort} />
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                Wir konnten leider nichts finden. Probier es mit weniger Filtern oder einer anderen
                Suche.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((product) => (
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
                      categoryName: product.category.name,
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
        </div>
      </div>
    </div>
  );
}
