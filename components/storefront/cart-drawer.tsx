'use client';

import * as React from 'react';
import { SmartImage as Image } from '@/components/shared/smart-image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { FreeShippingMeter } from './shop-bits';

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
};

export function CartDrawer({ items, subtotalCents }: CartDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const pathname = usePathname();
  // Beim Schließen per Link nicht auf den Warenkorb-Button zurückfokussieren –
  // sonst bleibt nach der Navigation ein dauerhafter Fokusring stehen.
  const closedByNavigation = React.useRef(false);
  const closeForNavigation = () => {
    closedByNavigation.current = true;
    setOpen(false);
  };

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            totalQuantity > 0 ? `Warenkorb öffnen, ${totalQuantity} Artikel` : 'Warenkorb öffnen'
          }
          className="relative"
          data-cart-target
        >
          <ShoppingBag className="h-5 w-5" />
          {totalQuantity > 0 ? (
            <Badge
              variant="solid"
              aria-hidden="true"
              className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1.5 ring-2 ring-background"
            >
              {totalQuantity}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
        onCloseAutoFocus={(e) => {
          if (closedByNavigation.current) {
            e.preventDefault();
            closedByNavigation.current = false;
          }
        }}
      >
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
              <div aria-hidden="true" className="flex items-end gap-1">
                <YarnBall wool="senf" className="h-10 w-10 motion-safe:animate-bob" />
                <YarnBall wool="himbeere" className="h-16 w-16" tail />
                <YarnBall wool="mint" className="h-8 w-8 motion-safe:animate-bob-slow" />
              </div>
              <p className="font-serif text-xl text-foreground">Noch ganz leer hier.</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Dein Korb wartet auf sein erstes Lieblingsstück.
              </p>
              <Button asChild onClick={closeForNavigation}>
                <Link href="/produkte">Kollektion entdecken</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <Link
                    href={`/produkte/${item.productSlug}`}
                    onClick={closeForNavigation}
                    className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/produkte/${item.productSlug}`}
                      onClick={closeForNavigation}
                      className="line-clamp-2 font-serif text-base font-semibold leading-snug hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatPriceCents(item.unitPriceCents)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          disabled={pending}
                          aria-label={`Menge von ${item.title} verringern`}
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className="w-7 text-center text-sm font-semibold tabular-nums"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={pending || item.quantity >= item.stock}
                          aria-label={`Menge von ${item.title} erhöhen`}
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleRemove(item.id)}
                        aria-label={`${item.title} entfernen`}
                        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
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
          <div className="border-t border-border bg-secondary px-6 py-5">
            <FreeShippingMeter subtotalCents={subtotalCents} />
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Zwischensumme</span>
              <span className="tabular-nums">{formatPriceCents(subtotalCents)}</span>
            </div>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">inkl. MwSt., zzgl. Versand</p>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" onClick={closeForNavigation}>
                <Link href="/checkout">Zur Kasse</Link>
              </Button>
              <Button asChild variant="outline" size="sm" onClick={closeForNavigation}>
                <Link href="/warenkorb">Warenkorb anzeigen</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
