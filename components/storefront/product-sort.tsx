'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_SORTS, type ProductSort } from '@/lib/products-shared';

export function ProductSortSelect({ value }: { value: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = React.useTransition();

  const onChange = (next: string) => {
    const params = new URLSearchParams(search.toString());
    if (next === 'newest') params.delete('sort');
    else params.set('sort', next);
    params.delete('page');
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[220px]" aria-label="Sortierung">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRODUCT_SORTS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
