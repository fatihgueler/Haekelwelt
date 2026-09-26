import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ChevronRight, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { TrustList, UniqueNote } from '@/components/storefront/shop-bits';
import { getCategoryTone, toneClasses, toneWool } from '@/lib/category-theme';
import { parseProductDescription } from '@/lib/product-details';
import { ReviewStars } from '@/components/storefront/review-stars';
import { ReviewsSection } from '@/components/storefront/reviews-section';
import { WishlistButton } from '@/components/storefront/wishlist-button';
import { db } from '@/lib/db';
import { TAX_RATE_PERCENT } from '@/lib/pricing';
import { getReviewSummary } from '@/lib/reviews';
import { absoluteUrl, cn, formatPriceCents } from '@/lib/utils';
import { getWishlistProductIds } from '@/lib/wishlist';

type Params = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: 'Produkt nicht gefunden' };
  return {
    title: product.title,
    description: parseProductDescription(product.description).paragraphs[0]?.slice(0, 160),
    openGraph: {
      title: product.title,
      description: parseProductDescription(product.description).paragraphs[0]?.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product || !product.isActive) notFound();

  const taxPercent = TAX_RATE_PERCENT[product.taxRate];
  const isSoldOut = product.stock <= 0;
  const isLast = product.stock > 0 && product.stock <= 1;

  const [reviewSummary, wishlist] = await Promise.all([
    getReviewSummary(product.id),
    getWishlistProductIds(),
  ]);
  const inWishlist = wishlist.has(product.id);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Häkelwelt' },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/produkte/${product.slug}`),
      priceCurrency: 'EUR',
      price: (product.priceCents / 100).toFixed(2),
      availability: isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(reviewSummary.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewSummary.average.toFixed(1),
            reviewCount: reviewSummary.count,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: absoluteUrl('/produkte') },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category.name,
        item: absoluteUrl(`/kategorie/${product.category.slug}`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: absoluteUrl(`/produkte/${product.slug}`),
      },
    ],
  };

  const tone = getCategoryTone(product.category.slug);
  const t = toneClasses[tone];
  const { paragraphs, details } = parseProductDescription(product.description);
  const related = await db.product
    .findMany({
      where: { isActive: true, categoryId: product.categoryId, NOT: { id: product.id } },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
    .catch(() => []);

  return (
    <div className="pb-16">
      <div className="container pt-6 lg:pt-10">
        <nav aria-label="Brotkrumen" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="underline-offset-4 hover:text-primary hover:underline">
                Start
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href="/produkte"
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href={`/kategorie/${product.category.slug}`}
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <ProductGallery
            title={product.title}
            surfaceClass={t.surface}
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              blurDataUrl: img.blurDataUrl,
            }))}
          />

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-3">
              <Link href={`/kategorie/${product.category.slug}`}>
                <Badge variant={tone} className="text-sm">
                  {product.category.name}
                </Badge>
              </Link>
              <h1 className="text-balance">{product.title}</h1>
              {reviewSummary.count > 0 ? (
                <Link
                  href="#reviews-heading"
                  className="inline-flex items-center gap-2 text-sm hover:text-primary"
                >
                  <ReviewStars value={reviewSummary.average} size="sm" />
                  <span className="text-muted-foreground">
                    {reviewSummary.average.toFixed(1)} ({reviewSummary.count} Bewertungen)
                  </span>
                </Link>
              ) : null}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">
                  {formatPriceCents(product.priceCents)}
                </p>
                <p className="text-sm text-muted-foreground">
                  inkl. {taxPercent} % MwSt., zzgl.{' '}
                  <Link href="/versand" className="underline underline-offset-2 hover:text-primary">
                    Versand
                  </Link>
                </p>
              </div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    isSoldOut ? 'bg-muted-foreground' : isLast ? 'bg-primary' : 'bg-success',
                  )}
                />
                {isSoldOut
                  ? 'Leider vergriffen – schreib uns, wenn du dir ein ähnliches Stück wünschst.'
                  : isLast
                    ? 'Nur noch 1 Stück – ein echtes Unikat'
                    : `Auf Lager · ${product.stock} Stück verfügbar`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AddToCartButton
                productId={product.id}
                disabled={isSoldOut}
                wool={toneWool[tone]}
                className="flex-1 sm:flex-none"
              />
              <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-sm">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              <p className="text-foreground">
                <strong className="font-semibold">
                  Verschickt in der Regel am nächsten Werktag.
                </strong>{' '}
                Lieferzeit in Deutschland 2–4 Werktage, in der EU 4–8 Werktage.{' '}
                <Link
                  href="/versand"
                  className="font-medium text-success underline underline-offset-2"
                >
                  Mehr zum Versand
                </Link>
              </p>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-pretty">
                  {para}
                </p>
              ))}
            </div>

            <UniqueNote />

            {details.length > 0 ? (
              <section
                aria-labelledby="details-heading"
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h2 id="details-heading" className="font-serif text-lg sm:text-lg">
                  Details
                </h2>
                <dl className="mt-3 divide-y divide-border text-sm">
                  {details.map((d) => (
                    <div key={d.label} className="grid grid-cols-[6rem_1fr] gap-3 py-2.5">
                      <dt className="font-semibold text-foreground">{d.label}</dt>
                      <dd className="text-muted-foreground">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <TrustList className="rounded-2xl bg-secondary p-5" />
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} productSlug={product.slug} />

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className={cn('py-12 lg:py-16', t.surface)}>
          <div className="container">
            <h2 id="related-heading" className="font-serif text-3xl">
              Mehr aus {product.category.name}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p, index) => (
                <ProductCard
                  key={p.id}
                  index={index}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    priceCents: p.priceCents,
                    imageUrl: p.images[0]?.url,
                    imageAlt: p.images[0]?.alt,
                    categorySlug: product.category.slug,
                    stock: p.stock,
                    inWishlist: wishlist.has(p.id),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Script
        id="ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}
