import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PicotDivider } from '@/components/illustrations/motifs';
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/storefront/shop-bits';
import { getNavCategories } from '@/lib/categories';
import { getCategoryTone, getCoreCategory, toneClasses, toneWool } from '@/lib/category-theme';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { getWishlistProductIds } from '@/lib/wishlist';

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
  const [category, wishlist, allCategories] = await Promise.all([
    loadCategory(slug),
    getWishlistProductIds(),
    getNavCategories(),
  ]);
  if (!category) notFound();

  const tone = getCategoryTone(category.slug);
  const t = toneClasses[tone];
  const others = allCategories.filter((c) => c.slug !== category.slug);
  const count = category.products.length;

  return (
    <div className="pb-16">
      <section className={cn('relative overflow-hidden', t.surface)}>
        <div aria-hidden="true" className="bg-granny absolute inset-0 opacity-70" />
        <div className="container relative grid items-center gap-6 py-10 sm:grid-cols-[1fr_auto] lg:py-14">
          <div>
            <nav aria-label="Brotkrumen" className="mb-4 text-sm">
              <ol className="flex flex-wrap items-center gap-1 text-foreground/80">
                <li>
                  <Link href="/" className="underline-offset-4 hover:underline">
                    Start
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                  <Link href="/produkte" className="underline-offset-4 hover:underline">
                    Shop
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li aria-current="page" className="font-semibold text-foreground">
                  {category.name}
                </li>
              </ol>
            </nav>
            <p className={cn('eyebrow', t.ink)}>Kategorie</p>
            <h1 className="mt-2">{category.name}</h1>
            {category.description ? (
              <p className="mt-3 max-w-xl text-pretty text-lg text-foreground/80">
                {category.description}
              </p>
            ) : null}
            <p className={cn('mt-4 text-sm font-semibold', t.ink)}>
              {count === 0 ? 'Gerade in Arbeit' : count === 1 ? '1 Unikat' : `${count} Unikate`}
            </p>
          </div>
          <div aria-hidden="true" className="hidden items-end gap-2 sm:flex">
            <YarnBall
              wool={toneWool[tone]}
              className="h-32 w-32 motion-safe:animate-bob-slow lg:h-40 lg:w-40"
              tail
            />
          </div>
        </div>
      </section>
      <PicotDivider flip className={cn('-mt-px', t.surfaceText)} />

      <div className="container pt-8">
        {count === 0 ? (
          <EmptyState
            title="Hier wird gerade noch gehäkelt."
            action={
              <Button asChild>
                <Link href="/produkte">Zur ganzen Kollektion</Link>
              </Button>
            }
          >
            In dieser Kategorie ist im Moment nichts verfügbar. Schau dich doch in der ganzen
            Kollektion um – oder komm bald wieder vorbei.
          </EmptyState>
        ) : (
          <section aria-labelledby="category-products">
            <h2 id="category-products" className="sr-only">
              Produkte in {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((product, index) => (
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
                    categoryName: category.name,
                    categorySlug: category.slug,
                    stock: product.stock,
                    inWishlist: wishlist.has(product.id),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {others.length > 0 ? (
          <nav aria-labelledby="weitere-kategorien" className="mt-16">
            <h2 id="weitere-kategorien" className="font-serif text-2xl sm:text-2xl">
              Noch mehr Welten
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kategorie/${c.slug}`}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform motion-safe:hover:-translate-y-0.5',
                      toneClasses[c.tone].surface,
                    )}
                  >
                    <span
                      className={cn('h-2.5 w-2.5 rounded-full', toneClasses[c.tone].dot)}
                      aria-hidden
                    />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
