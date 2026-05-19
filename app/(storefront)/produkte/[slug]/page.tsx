import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/storefront/add-to-cart-button';
import { ReviewStars } from '@/components/storefront/review-stars';
import { ReviewsSection } from '@/components/storefront/reviews-section';
import { WishlistButton } from '@/components/storefront/wishlist-button';
import { db } from '@/lib/db';
import { TAX_RATE_PERCENT } from '@/lib/pricing';
import { getReviewSummary } from '@/lib/reviews';
import { absoluteUrl, formatPriceCents } from '@/lib/utils';
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
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
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

  return (
    <div className="container py-10 lg:py-16">
      <nav
        aria-label="Brotkrumen"
        className="mb-8 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-primary">
          Start
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/produkte" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/kategorie/${product.category.slug}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder={product.images[0].blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={product.images[0].blurDataUrl ?? undefined}
                className="object-cover"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 1024px) 25vw, 12vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3">
            <Link
              href={`/kategorie/${product.category.slug}`}
              className="inline-block text-sm font-medium uppercase tracking-wide text-primary"
            >
              {product.category.name}
            </Link>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">{product.title}</h1>
            {reviewSummary.count > 0 ? (
              <Link
                href="#reviews-heading"
                className="inline-flex items-center gap-2 text-sm hover:text-primary"
              >
                <ReviewStars value={reviewSummary.average} size="sm" />
                <span className="text-muted-foreground">
                  {reviewSummary.average.toFixed(1)} ({reviewSummary.count})
                </span>
              </Link>
            ) : null}
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-semibold text-foreground">
                {formatPriceCents(product.priceCents)}
              </p>
              <p className="text-sm text-muted-foreground">
                inkl. {taxPercent} % MwSt., zzgl.{' '}
                <Link href="/versand" className="underline-offset-2 hover:underline">
                  Versand
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isSoldOut ? (
                <Badge variant="destructive">Ausverkauft</Badge>
              ) : isLast ? (
                <Badge variant="accent">Nur 1 Stück verfügbar</Badge>
              ) : (
                <Badge variant="secondary">Auf Lager · {product.stock} verfügbar</Badge>
              )}
              <Badge variant="outline">Handarbeit aus Deutschland</Badge>
            </div>
          </div>

          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {product.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <AddToCartButton productId={product.id} disabled={isSoldOut} />
            <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
            <Link
              href="/versand"
              className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            >
              Versand & Lieferzeiten
            </Link>
          </div>

          <dl className="grid gap-3 rounded-2xl border border-border bg-secondary/30 p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Material</dt>
              <dd className="text-foreground">100 % Naturfaser</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lieferzeit DE</dt>
              <dd className="text-foreground">2–4 Werktage</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lieferzeit EU</dt>
              <dd className="text-foreground">4–8 Werktage</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Pflege</dt>
              <dd className="text-foreground">Handwäsche kalt</dd>
            </div>
          </dl>
        </div>
      </div>

      <ReviewsSection productId={product.id} productSlug={product.slug} />

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
