import Link from 'next/link';
import { ArrowRight, Gift, Heart, Leaf, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HeroArt } from '@/components/illustrations/hero-art';
import {
  CrochetHook,
  GrannySquare,
  PicotDivider,
  ThreadLine,
} from '@/components/illustrations/motifs';
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { SmartImage as Image } from '@/components/shared/smart-image';
import { ProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/storefront/shop-bits';
import { getNavCategories } from '@/lib/categories';
import { toneClasses, toneWool } from '@/lib/category-theme';
import { db } from '@/lib/db';
import { reveal } from '@/lib/reveal';
import { SITE } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import { getWishlistProductIds } from '@/lib/wishlist';

export const dynamic = 'force-dynamic';

async function loadHomeData() {
  try {
    const [featured, previews] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      db.category.findMany({
        select: {
          slug: true,
          _count: { select: { products: { where: { isActive: true } } } },
          products: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
          },
        },
      }),
    ]);
    return { featured, previews };
  } catch {
    return { featured: [], previews: [] };
  }
}

export default async function HomePage() {
  const [{ featured, previews }, categories, wishlist] = await Promise.all([
    loadHomeData(),
    getNavCategories(),
    getWishlistProductIds(),
  ]);
  const previewBySlug = new Map(previews.map((p) => [p.slug, p]));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-granny relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-cat-heimdeko-surface opacity-60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cat-kinder-surface opacity-60 blur-3xl"
        />
        <div className="container relative grid items-center gap-8 pb-10 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-16 lg:pt-16">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-primary shadow-soft">
              <Heart className="h-4 w-4 fill-current" aria-hidden /> Handgehäkelt mit Liebe
            </p>
            <h1 className="display text-balance">
              Kleine Schätze,{' '}
              <span className="text-primary underline decoration-cat-heimdeko-deco decoration-wavy decoration-[3px] underline-offset-[0.22em] [text-decoration-skip-ink:none]">
                Masche für Masche.
              </span>
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              Kuscheltiere, Decken, Mützen und Babyschuhe – jedes Stück häkeln wir von Hand in
              unserer kleinen Werkstatt. Aus guter Wolle, mit viel Geduld und so bunt, dass es gute
              Laune macht.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/produkte">
                  Kollektion entdecken <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ueber-uns">Die Werkstatt kennenlernen</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium text-foreground">
              <li className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-success" aria-hidden /> Gratisversand ab 50 €
              </li>
              <li className="inline-flex items-center gap-2">
                <Leaf className="h-4 w-4 text-success" aria-hidden /> Plastikfrei verpackt
              </li>
              <li className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-success" aria-hidden /> Jedes Stück ein Unikat
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[540px]">
            <HeroArt className="h-auto w-full" />
            <p
              aria-hidden="true"
              className="absolute left-0 top-0 -rotate-6 font-hand text-2xl text-primary sm:text-3xl lg:-left-8"
            >
              von Hand gemacht ♥
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Kategorien ---------- */}
      <PicotDivider className="text-secondary" />
      <section aria-labelledby="welten-heading" className="bg-secondary py-14 lg:py-20">
        <div className="container space-y-10">
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            {...reveal(0)}
          >
            <div>
              <p className="eyebrow">Kategorien</p>
              <h2 id="welten-heading" className="mt-2">
                Stöbere durch unsere Welten
              </h2>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Vier Farben, vier Welten – jede Kategorie hat ihre eigene Wolle.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => {
              const t = toneClasses[cat.tone];
              const preview = previewBySlug.get(cat.slug);
              const img = preview?.products[0]?.images[0];
              const count = preview?._count.products ?? 0;
              return (
                <li key={cat.slug} {...reveal(i)}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className={cn(
                      'group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-soft transition-[transform,box-shadow] duration-300 ease-soft hover:shadow-soft-lg motion-safe:hover:-translate-y-1',
                      t.surface,
                    )}
                  >
                    <div className="relative mb-5 flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl bg-card/60">
                      {img ? (
                        <Image
                          src={img.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                          className="object-cover transition-transform duration-500 ease-soft motion-safe:group-hover:scale-105"
                        />
                      ) : (
                        <YarnBall
                          wool={toneWool[cat.tone]}
                          className="h-24 w-24 transition-transform duration-500 motion-safe:group-hover:rotate-[25deg]"
                        />
                      )}
                    </div>
                    <h3 className="font-serif text-2xl sm:text-2xl">{cat.name}</h3>
                    {cat.description ? (
                      <p className="mt-2 flex-1 text-sm text-foreground/80">{cat.description}</p>
                    ) : null}
                    <span
                      className={cn(
                        'mt-4 inline-flex items-center gap-1 text-sm font-semibold',
                        t.ink,
                      )}
                    >
                      {count > 0 ? `${count} Stücke entdecken` : 'Entdecken'}
                      <ArrowRight
                        className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <PicotDivider className="text-secondary" flip />

      {/* ---------- Neuheiten ---------- */}
      <section aria-labelledby="neu-heading" className="relative py-14 lg:py-20">
        <ThreadLine className="absolute inset-x-0 top-0 text-cat-amigurumi-deco opacity-70" />
        <div className="container relative">
          <div
            className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            {...reveal(0)}
          >
            <div>
              <p className="eyebrow">Neu im Shop</p>
              <h2 id="neu-heading" className="mt-2">
                Frisch von der Nadel
              </h2>
            </div>
            {featured.length > 0 ? (
              <Button asChild variant="outline">
                <Link href="/produkte">
                  Alle Produkte <ArrowRight aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>

          {featured.length === 0 ? (
            <EmptyState
              title="Gerade frisch auf der Nadel."
              action={
                <Button asChild variant="secondary">
                  <Link href="/ueber-uns">So arbeiten wir</Link>
                </Button>
              }
            >
              Die nächsten Stücke entstehen gerade. Trag dich unten in den Newsletter ein – dann
              erfährst du zuerst, wenn sie fertig sind.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {featured.map((product, index) => (
                <ProductCard
                  key={product.id}
                  index={index}
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
          )}
        </div>
      </section>

      {/* ---------- So entsteht ein Stück ---------- */}
      <section
        aria-labelledby="prozess-heading"
        className="relative overflow-hidden bg-accent py-14 lg:py-20"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl text-center" {...reveal(0)}>
            <p className="eyebrow text-accent-foreground">Handarbeit</p>
            <h2 id="prozess-heading" className="mt-2">
              So entsteht ein Stück
            </h2>
            <p className="mt-3 text-pretty text-foreground/80">
              Keine Maschine, keine Serie: Jedes Teil entsteht in drei Schritten – alle davon von
              Hand.
            </p>
          </div>

          <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
            <ThreadLine
              variant="b"
              className="absolute inset-x-0 top-10 hidden text-accent-foreground/40 md:block"
            />
            {[
              {
                title: 'Wolle wählen',
                text: 'Wir suchen weiche Naturfasern aus – Bio-Baumwolle, Merino, Alpaka – in Farben, die glücklich machen.',
                visual: (
                  <div className="flex items-end gap-1">
                    <YarnBall wool="himbeere" className="h-12 w-12" />
                    <YarnBall wool="senf" className="h-9 w-9" />
                    <YarnBall wool="mint" className="h-10 w-10" />
                  </div>
                ),
              },
              {
                title: 'Masche für Masche',
                text: 'Dann wird gehäkelt: zwei bis zwanzig Stunden pro Stück, je nach Größe. Jede Masche setzen wir von Hand.',
                visual: <CrochetHook className="h-8 w-40 text-primary" />,
              },
              {
                title: 'Mit Liebe verpackt',
                text: 'Zum Schluss wandert dein Stück in Seidenpapier und Karton – plastikfrei, mit einer handgeschriebenen Karte.',
                visual: (
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-primary shadow-soft">
                    <Gift className="h-7 w-7" aria-hidden />
                  </span>
                ),
              },
            ].map((step, i) => (
              <li
                key={step.title}
                className="relative flex flex-col items-start gap-4 rounded-3xl bg-card p-6 shadow-soft"
                {...reveal(i + 1)}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="relative inline-flex h-12 w-12 items-center justify-center">
                    <GrannySquare className="absolute inset-0 h-12 w-12" />
                    <span className="relative font-serif text-lg font-semibold text-foreground">
                      {i + 1}
                    </span>
                  </span>
                  <div aria-hidden="true">{step.visual}</div>
                </div>
                <h3 className="font-serif text-xl sm:text-xl">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Werkstatt-Teaser ---------- */}
      <section aria-labelledby="werkstatt-heading" className="py-14 lg:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative" {...reveal(0)}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cat-heimdeko-surface shadow-soft">
              {/* Platzhalter für ein echtes Werkstatt-Foto ({{WERKSTATT_FOTO}}) */}
              <div aria-hidden="true" className="bg-granny absolute inset-0 opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <YarnBall wool="pfirsich" className="h-20 w-20 motion-safe:animate-bob" />
                <YarnBall wool="lavendel" className="h-28 w-28" tail />
                <YarnBall wool="himmelblau" className="h-16 w-16 motion-safe:animate-bob-slow" />
              </div>
              <p className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground">
                Foto folgt: {SITE.workshopPhoto}
              </p>
            </div>
            <GrannySquare
              className="absolute -right-2 -top-4 h-14 w-14 rotate-12 drop-shadow-sm sm:-right-4 sm:h-16 sm:w-16"
              colors={['#4BA1D2', '#E05C88', '#E4A425']}
            />
          </div>
          <div className="space-y-5" {...reveal(1)}>
            <p className="eyebrow">Aus der Werkstatt</p>
            <h2 id="werkstatt-heading">Hallo, schön, dass du da bist!</h2>
            <p className="text-pretty text-lg text-muted-foreground">
              Hinter Häkelwelt steckt eine kleine Werkstatt in {SITE.workshopCity}: ein Tisch am
              Fenster, sehr viel Wolle und ganz viel Geduld. Was als Hobby begann, ist heute ein
              kleiner Laden voller Unikate.
            </p>
            <p className="text-pretty text-muted-foreground">
              Du hast einen Wunsch – eine andere Farbe, einen Namen auf der Decke? Schreib uns
              einfach. Wir antworten meistens innerhalb von {SITE.responseTime}.
            </p>
            <p aria-hidden="true" className="-rotate-2 font-hand text-3xl text-primary">
              Alles Liebe, {SITE.ownerName}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/ueber-uns">Unsere Geschichte</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/kontakt">Wunsch schreiben</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
