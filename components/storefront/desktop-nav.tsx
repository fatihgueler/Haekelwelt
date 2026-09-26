'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toneClasses, type CategoryTone } from '@/lib/category-theme';
import { cn } from '@/lib/utils';

export type DesktopNavCategory = { slug: string; name: string; tone: CategoryTone };

const linkBase =
  'relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-secondary hover:text-foreground';

export function DesktopNav({ categories }: { categories: DesktopNavCategory[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const inCategory = pathname.startsWith('/kategorie/');

  return (
    <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
      <Link
        href="/produkte"
        aria-current={isActive('/produkte') ? 'page' : undefined}
        className={cn(linkBase, isActive('/produkte') && 'bg-primary-soft text-primary')}
      >
        Shop
      </Link>

      {/* md–xl: Kategorien im Dropdown */}
      <div className="xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(linkBase, 'group', inCategory && 'bg-primary-soft text-primary')}
          >
            Kategorien
            <ChevronDown
              className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((cat) => (
              <DropdownMenuItem key={cat.slug} asChild>
                <Link href={`/kategorie/${cat.slug}`}>
                  <span
                    className={cn('h-3 w-3 rounded-full', toneClasses[cat.tone].dot)}
                    aria-hidden
                  />
                  {cat.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/produkte">Alle Produkte ansehen</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ab xl: Kategorien direkt sichtbar */}
      <ul className="hidden items-center gap-1 xl:flex">
        {categories.map((cat) => {
          const href = `/kategorie/${cat.slug}`;
          const active = isActive(href);
          return (
            <li key={cat.slug}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(linkBase, 'group', active && 'bg-secondary text-foreground')}
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-125',
                    toneClasses[cat.tone].dot,
                  )}
                  aria-hidden
                />
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/ueber-uns"
        aria-current={isActive('/ueber-uns') ? 'page' : undefined}
        className={cn(linkBase, isActive('/ueber-uns') && 'bg-primary-soft text-primary')}
      >
        Über uns
      </Link>
    </nav>
  );
}
