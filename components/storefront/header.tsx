import Link from 'next/link';
import { Heart, User } from 'lucide-react';

import { auth } from '@/auth';
import { getNavCategories } from '@/lib/categories';
import { getCart } from '@/lib/cart';
import { priceCart, SHIPPING_DE_FREE_FROM_CENTS } from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { CartDrawer, type CartDrawerItem } from './cart-drawer';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';
import { SearchBar } from './search-bar';

export async function Header() {
  const [session, categories, cart] = await Promise.all([auth(), getNavCategories(), getCart()]);

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

  const navCategories = categories.map((c) => ({ slug: c.slug, name: c.name, tone: c.tone }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container flex h-16 items-center gap-2 lg:h-20">
        <MobileNav categories={navCategories} isLoggedIn={Boolean(session?.user)} />
        <Logo size="md" className="mr-2 lg:mr-4" />

        <DesktopNav categories={navCategories} />

        <SearchBar className="ml-auto hidden w-full min-w-0 max-w-[15rem] flex-1 lg:flex" />

        <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Wunschliste"
          >
            <Link href="/konto/wunschliste" prefetch={false}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={session?.user ? 'Mein Konto' : 'Anmelden'}
          >
            <Link href={session?.user ? '/konto' : '/login'}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <CartDrawer items={drawerItems} subtotalCents={pricing.subtotalCents} />
        </div>
      </div>
    </header>
  );
}
