'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchBar({
  className,
  variant = 'header',
  placeholder = 'Suche nach Produkten…',
}: {
  className?: string;
  variant?: 'header' | 'inline';
  placeholder?: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [value, setValue] = React.useState(search.get('q') ?? '');

  React.useEffect(() => {
    setValue(search.get('q') ?? '');
  }, [search]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    router.push(qs ? `/produkte?${qs}` : '/produkte');
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn('relative', className)}
      aria-label="Produktsuche"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="q"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn('pl-9', variant === 'header' && 'h-10')}
      />
    </form>
  );
}
