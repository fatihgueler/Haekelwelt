'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { formatPriceCents } from '@/lib/utils';
import { removeCartItemAction, setCartItemQuantityAction } from '@/actions/cart';

export type CartDrawerItem = {
  id: string;
  productSlug: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  unitPriceCents: number;
  quantity: number;
  stock: number;
};

export type CartDrawerProps = {
  items: CartDrawerItem[];
  subtotalCents: number;
  shippingHint: string;
};

export function CartDrawer({ items, subtotalCents, shippingHint }: CartDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleQty = (itemId: string, quantity: number) => {
    startTransition(async () => {
      const res = await setCartItemQuantityAction({ itemId, quantity });
      if (!res.ok) toast.error(res.error);
    });
  };

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const res = await removeCartItemAction({ itemId });
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Warenkorb öffnen" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalQuantity > 0 ? (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-primary px-1.5 text-primary-foreground"
            >
              {totalQuantity}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle>Dein Warenkorb</SheetTitle>
          <SheetDescription>
            {totalQuantity === 0
              ? 'Dein Warenkorb ist leer.'
              : `${totalQuantity} Artikel im Warenkorb.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-muted-foreground">
                Stöbere durch unsere Kollektionen und finde dein Lieblingsstück.
              </p>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/produkte">Zum Shop</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <Link
                    href={`/produkte/${item.productSlug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/produkte/${item.productSlug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPriceCents(item.unitPriceCents)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          disabled={pending}
                          aria-label="Menge verringern"
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={pending || item.quantity >= item.stock}
                          aria-label="Menge erhöhen"
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleRemove(item.id)}
                        aria-label="Artikel entfernen"
                        className="ml-auto text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border bg-secondary/30 px-6 py-5">
            <div className="flex items-center justify-between text-base font-medium">
              <span>Zwischensumme</span>
              <span>{formatPriceCents(subtotalCents)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{shippingHint}</p>
            <Separator className="my-4" />
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">Zur Kasse</Link>
              </Button>
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Link href="/warenkorb">Warenkorb anzeigen</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
