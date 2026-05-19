'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export type FilterCategory = { id: string; slug: string; name: string; count: number };

export type ProductFiltersProps = {
  categories: FilterCategory[];
  priceMinCents: number;
  priceMaxCents: number;
  selectedCategories: string[];
  selectedMin?: number;
  selectedMax?: number;
  inStockOnly: boolean;
};

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <>
      <div className="hidden lg:block">
        <FiltersPanel {...props} />
      </div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filter</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function FiltersPanel({
  categories,
  priceMinCents,
  priceMaxCents,
  selectedCategories,
  selectedMin,
  selectedMax,
  inStockOnly,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const minEur = Math.floor(priceMinCents / 100);
  const maxEur = Math.ceil(priceMaxCents / 100);
  const [minDraft, setMinDraft] = React.useState(
    selectedMin !== undefined ? String(Math.floor(selectedMin / 100)) : '',
  );
  const [maxDraft, setMaxDraft] = React.useState(
    selectedMax !== undefined ? String(Math.ceil(selectedMax / 100)) : '',
  );

  const updateParams = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(search.toString());
    mut(next);
    next.delete('page');
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const toggleCategory = (slug: string, checked: boolean) => {
    updateParams((p) => {
      const current = new Set(p.getAll('cat'));
      p.delete('cat');
      if (checked) current.add(slug);
      else current.delete(slug);
      for (const s of current) p.append('cat', s);
    });
  };

  const applyPrice = () => {
    updateParams((p) => {
      const minNum = Number(minDraft);
      const maxNum = Number(maxDraft);
      if (minDraft && Number.isFinite(minNum) && minNum > 0) p.set('min', String(minNum * 100));
      else p.delete('min');
      if (maxDraft && Number.isFinite(maxNum) && maxNum > 0) p.set('max', String(maxNum * 100));
      else p.delete('max');
    });
  };

  const toggleStock = (checked: boolean) =>
    updateParams((p) => {
      if (checked) p.set('stock', '1');
      else p.delete('stock');
    });

  const reset = () =>
    updateParams((p) => {
      p.delete('cat');
      p.delete('min');
      p.delete('max');
      p.delete('stock');
      setMinDraft('');
      setMaxDraft('');
    });

  const hasActive =
    selectedCategories.length > 0 ||
    selectedMin !== undefined ||
    selectedMax !== undefined ||
    inStockOnly;

  return (
    <aside aria-label="Produktfilter" className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-serif text-base">Kategorien</h3>
        <ul className="space-y-2">
          {categories.map((cat) => {
            const id = `cat-${cat.slug}`;
            const checked = selectedCategories.includes(cat.slug);
            return (
              <li key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(v) => toggleCategory(cat.slug, v === true)}
                  disabled={pending}
                />
                <Label htmlFor={id} className="flex-1 cursor-pointer text-sm">
                  {cat.name}
                </Label>
                <span className="text-xs text-muted-foreground">{cat.count}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="font-serif text-base">Preis (€)</h3>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="price-min" className="text-xs text-muted-foreground">
              ab
            </Label>
            <Input
              id="price-min"
              type="number"
              inputMode="numeric"
              min={minEur}
              max={maxEur}
              placeholder={String(minEur)}
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="price-max" className="text-xs text-muted-foreground">
              bis
            </Label>
            <Input
              id="price-max"
              type="number"
              inputMode="numeric"
              min={minEur}
              max={maxEur}
              placeholder={String(maxEur)}
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={applyPrice}
          variant="outline"
          size="sm"
          disabled={pending}
          className="w-full"
        >
          Anwenden
        </Button>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="font-serif text-base">Verfügbarkeit</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(v) => toggleStock(v === true)}
            disabled={pending}
          />
          <Label htmlFor="in-stock" className="cursor-pointer text-sm">
            Nur lieferbare Artikel anzeigen
          </Label>
        </div>
      </section>

      {hasActive ? (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={reset} disabled={pending} className="gap-2">
            <X className="h-4 w-4" /> Alle Filter zurücksetzen
          </Button>
        </>
      ) : null}
    </aside>
  );
}
