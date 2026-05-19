import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaginationProps = {
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  pageCount: number;
};

function buildHref(
  pathname: string,
  searchParams: PaginationProps['searchParams'],
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page') continue;
    if (Array.isArray(value)) for (const v of value) params.append(key, v);
    else if (value !== undefined) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({ pathname, searchParams, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages: (number | 'gap')[] = [];
  const push = (n: number | 'gap') => pages.push(n);

  push(1);
  if (page > 3) push('gap');
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) push(p);
  if (page < pageCount - 2) push('gap');
  if (pageCount > 1) push(pageCount);

  return (
    <nav aria-label="Seitennavigation" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={buildHref(pathname, searchParams, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-sm',
          page === 1 && 'pointer-events-none opacity-50',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Vorherige Seite</span>
      </Link>
      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(pathname, searchParams, p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-card px-3 text-sm transition-colors',
              p === page
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:border-primary hover:text-primary',
            )}
          >
            {p}
          </Link>
        ),
      )}
      <Link
        href={buildHref(pathname, searchParams, Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-sm',
          page === pageCount && 'pointer-events-none opacity-50',
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Nächste Seite</span>
      </Link>
    </nav>
  );
}
