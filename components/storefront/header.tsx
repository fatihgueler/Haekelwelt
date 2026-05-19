import Link from 'next/link';
import { Heart, Menu, User } from 'lucide-react';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getCart } from '@/lib/cart';
import { priceCart, SHIPPING_DE_FREE_FROM_CENTS } from '@/lib/pricing';
import { formatPriceCents } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { CartDrawer, type CartDrawerItem } from './cart-drawer';

export async function Header() {
  const [session, categories, cart] = await Promise.all([
    auth(),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    getCart(),
  ]);

  const drawerItems: CartDrawerItem[] = (cart?.items ?? []).map((i) => ({
    id: i.id,
    productSlug: i.product.slug,
    title: i.product.title,
    imageUrl: i.product.images[0]?.url,
    imageAlt: i.product.images[0]?.alt,
    unitPriceCents: i.product.priceCents,
    quantity: i.quantity,
    stock: i.product.stock,
  }));

  const pricing = cart
    ? priceCart(
        cart.items.map((i) => ({
          priceCents: i.product.priceCents,
          quantity: i.quantity,
          taxRate: i.product.taxRate,
        })),
        { countryCode: 'DE' },
      )
    : { subtotalCents: 0, freeShippingMissingCents: SHIPPING_DE_FREE_FROM_CENTS };

  const shippingHint =
    pricing.freeShippingMissingCents !== null && pricing.freeShippingMissingCents > 0
      ? `Noch ${formatPriceCents(pricing.freeShippingMissingCents)} bis zum Gratisversand in Deutschland.`
      : 'Versand inklusive – freu dich auf dein Paket.';

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-3 lg:h-20">
        <Logo size="md" />

        <nav className="ml-8 hidden items-center gap-6 md:flex">
          <Link
            href="/produkte"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Alle Produkte
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategorie/${cat.slug}`}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Wunschliste"
          >
            <Link href="/konto/wunschliste">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Konto">
            <Link href={session?.user ? '/konto' : '/login'}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <CartDrawer
            items={drawerItems}
            subtotalCents={pricing.subtotalCents}
            shippingHint={shippingHint}
          />
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
