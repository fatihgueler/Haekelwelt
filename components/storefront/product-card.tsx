import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { formatPriceCents } from '@/lib/utils';

export type ProductCardData = {
  slug: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
  imageAlt?: string;
  blurDataUrl?: string;
  categoryName?: string;
  stock: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const isLast = product.stock > 0 && product.stock <= 1;
  const isSoldOut = product.stock <= 0;
  return (
    <Link
      href={`/produkte/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <article className="space-y-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder={product.blurDataUrl ? 'blur' : 'empty'}
              blurDataURL={product.blurDataUrl}
              className="object-cover transition-transform duration-300 ease-soft group-hover:scale-[1.03]"
            />
          ) : null}
          {product.categoryName ? (
            <Badge
              variant="default"
              className="absolute left-3 top-3 bg-background/85 text-foreground backdrop-blur"
            >
              {product.categoryName}
            </Badge>
          ) : null}
          {isSoldOut ? (
            <Badge variant="destructive" className="absolute right-3 top-3">
              Ausverkauft
            </Badge>
          ) : isLast ? (
            <Badge variant="accent" className="absolute right-3 top-3">
              Nur 1 verfügbar
            </Badge>
          ) : null}
        </div>
        <div className="space-y-1 px-1">
          <h3 className="font-serif text-lg leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground">{formatPriceCents(product.priceCents)}</p>
        </div>
      </article>
    </Link>
  );
}
