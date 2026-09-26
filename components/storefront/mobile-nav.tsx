'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, ShoppingBag, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SERVICE_LINKS, toneClasses, type CategoryTone } from '@/lib/category-theme';
import { cn } from '@/lib/utils';
import { SearchBar } from './search-bar';

export type MobileNavCategory = { slug: string; name: string; tone: CategoryTone };

export function MobileNav({
  categories,
  isLoggedIn,
}: {
  categories: MobileNavCategory[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  // Wird per Link geschlossen, soll der Fokus nicht auf den Menü-Button
  // zurückspringen (sonst bleibt nach der Navigation ein Fokusring stehen).
  const closedByNavigation = React.useRef(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navigate = () => {
    closedByNavigation.current = true;
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü öffnen">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[86vw] max-w-sm flex-col gap-0 overflow-y-auto p-0"
        onCloseAutoFocus={(e) => {
          if (closedByNavigation.current) {
            e.preventDefault();
            closedByNavigation.current = false;
          }
        }}
      >
        <SheetHeader className="border-b border-border px-6 pb-4 pt-6">
          <SheetTitle>Menü</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation durch Shop, Kategorien und Service-Seiten
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4">
          <SearchBar variant="inline" onSubmitted={navigate} />
        </div>

        <nav aria-label="Hauptnavigation mobil" className="flex-1 px-3 pb-6">
          <ul className="space-y-1">
            <li className="menu-item-in" style={{ '--i': 0 } as React.CSSProperties}>
              <MobileLink href="/produkte" active={isActive('/produkte')} onNavigate={navigate}>
                <ShoppingBag className="h-4 w-4 text-primary" aria-hidden />
                Alle Produkte
              </MobileLink>
            </li>
          </ul>

          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Kategorien
          </p>
          <ul className="space-y-1">
            {categories.map((cat, index) => (
              <li
                key={cat.slug}
                className="menu-item-in"
                style={{ '--i': index + 1 } as React.CSSProperties}
              >
                <MobileLink
                  href={`/kategorie/${cat.slug}`}
                  active={isActive(`/kategorie/${cat.slug}`)}
                  onNavigate={navigate}
                >
                  <span
                    className={cn('h-3 w-3 rounded-full', toneClasses[cat.tone].dot)}
                    aria-hidden
                  />
                  {cat.name}
                </MobileLink>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Service
          </p>
          <ul className="space-y-1">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <MobileLink href={link.href} active={isActive(link.href)} onNavigate={navigate}>
                  {link.label}
                </MobileLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-border px-3 pt-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/konto/wunschliste" onClick={navigate}>
                <Heart className="h-4 w-4" aria-hidden /> Merkliste
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={isLoggedIn ? '/konto' : '/login'} onClick={navigate}>
                <User className="h-4 w-4" aria-hidden /> {isLoggedIn ? 'Konto' : 'Anmelden'}
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-secondary',
        active && 'bg-primary-soft text-primary',
      )}
    >
      {children}
    </Link>
  );
}
