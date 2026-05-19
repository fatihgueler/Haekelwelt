import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Leaf, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/storefront/product-card';
import { db } from '@/lib/db';
import { getWishlistProductIds } from '@/lib/wishlist';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, categories, wishlist] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    getWishlistProductIds(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
        <div className="container grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Heart className="h-3.5 w-3.5" /> Handgehäkelt mit Liebe
            </span>
            <h1 className="text-balance font-serif text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              Kleine Schätze, die deinen Alltag wärmer machen.
            </h1>
            <p className="max-w-prose text-balance text-base text-muted-foreground sm:text-lg">
              Jedes Stück entsteht in unserer kleinen Werkstatt – Masche für Masche, mit
              ausgewählten Wollen und einem Auge fürs Detail. Wir versenden klimaneutral aus
              Deutschland, in Europa zuhause.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/produkte">
                  Zur Kollektion <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ueber-uns">Unsere Geschichte</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-soft-lg lg:aspect-[5/6]">
            {featured[0]?.images[0] ? (
              <Image
                src={featured[0].images[0].url}
                alt={featured[0].images[0].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Heart className="h-5 w-5" />}
            title="Mit Liebe gefertigt"
            description="Jedes Produkt entsteht in Handarbeit – mit Sorgfalt, nicht in Serie."
          />
          <Feature
            icon={<Leaf className="h-5 w-5" />}
            title="Naturmaterialien"
            description="Wolle und Baumwolle aus geprüft nachhaltigen Quellen."
          />
          <Feature
            icon={<Package className="h-5 w-5" />}
            title="Gratisversand ab 50 €"
            description="Plastikfrei verpackt, klimaneutral mit DHL versendet."
          />
        </div>
      </section>

      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container space-y-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">Kategorien</p>
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Stöbere durch unsere Welten
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategorie/${cat.slug}`}
                className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <h3 className="font-serif text-xl tracking-tight group-hover:text-primary">
                  {cat.name}
                </h3>
                {cat.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Entdecken{' '}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Neu im Shop</p>
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">Frisch eingetroffen</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/produkte">
              Alle Produkte <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
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
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </div>
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
