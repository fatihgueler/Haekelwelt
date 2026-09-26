import Link from 'next/link';

import { SmartImage as Image } from '@/components/shared/smart-image';
import { Badge } from '@/components/ui/badge';
import { getCategoryTone, toneClasses, toneWool } from '@/lib/category-theme';
import { reveal } from '@/lib/reveal';
import { cn, formatPriceCents } from '@/lib/utils';
import { AddToCartButton } from './add-to-cart-button';
import { WishlistButton } from './wishlist-button';

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
  imageAlt?: string;
  blurDataUrl?: string;
  categoryName?: string;
  categorySlug?: string;
  stock: number;
  inWishlist?: boolean;
};

export function ProductCard({
  product,
  showWishlist = true,
  showAddToCart = true,
  index = 0,
  priority = false,
}: {
  product: ProductCardData;
  showWishlist?: boolean;
  showAddToCart?: boolean;
  /** Position im Grid – für gestaffeltes Einblenden */
  index?: number;
  priority?: boolean;
}) {
  const isLast = product.stock === 1;
  const isSoldOut = product.stock <= 0;
  const tone = getCategoryTone(product.categorySlug);
  const t = toneClasses[tone];
  const titleId = `product-${product.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="card-wobble group relative flex flex-col"
      {...reveal(index % 4)}
    >
      <div className="card-wobble-target relative">
        {showWishlist ? (
          <WishlistButton
            productId={product.id}
            initialInWishlist={product.inWishlist ?? false}
            size="sm"
            className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
          />
        ) : null}
        <Link
          href={`/produkte/${product.slug}`}
          className="block rounded-3xl focus-visible:ring-offset-4"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div
            className={cn(
              'relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft transition-shadow duration-300 group-hover:shadow-soft-lg sm:rounded-3xl',
              t.surface,
            )}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                placeholder={product.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={product.blurDataUrl}
                className="object-cover transition-transform duration-500 ease-soft motion-safe:group-hover:scale-[1.04]"
              />
            ) : null}
            {product.categoryName ? (
              <Badge
                variant={tone}
                className="absolute left-2 top-2 max-w-[calc(100%-3.5rem)] truncate border border-background/60 shadow-soft sm:left-3 sm:top-3"
              >
                {product.categoryName}
              </Badge>
            ) : null}
            {isSoldOut ? (
              <Badge
                variant="solid"
                className="absolute bottom-3 left-3 bg-foreground text-background"
              >
                Leider vergriffen
              </Badge>
            ) : isLast ? (
              <Badge variant="solid" className="absolute bottom-3 left-3">
                Nur noch 1 · Unikat
              </Badge>
            ) : null}
          </div>
        </Link>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1 px-1">
        <h3 id={titleId} className="font-serif text-base leading-snug tracking-tight sm:text-lg">
          <Link
            href={`/produkte/${product.slug}`}
            className="rounded-sm transition-colors after:absolute after:inset-0 after:rounded-3xl hover:text-primary focus-visible:shadow-none focus-visible:ring-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background"
          >
            {product.title}
          </Link>
        </h3>
        <p className="text-base font-semibold tabular-nums text-foreground">
          {formatPriceCents(product.priceCents)}
        </p>
      </div>

      {showAddToCart && !isSoldOut ? (
        <div className="relative z-10 mt-3 px-1">
          <AddToCartButton
            productId={product.id}
            size="sm"
            label="In den Korb"
            wool={toneWool[tone]}
            className="w-full min-w-0 sm:w-auto"
          />
        </div>
      ) : null}
    </article>
  );
}
