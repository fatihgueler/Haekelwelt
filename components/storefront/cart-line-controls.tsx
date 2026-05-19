'use client';

import * as React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { removeCartItemAction, setCartItemQuantityAction } from '@/actions/cart';

export function CartLineControls({
  itemId,
  quantity,
  stock,
}: {
  itemId: string;
  quantity: number;
  stock: number;
}) {
  const [pending, startTransition] = React.useTransition();

  const update = (qty: number) =>
    startTransition(async () => {
      const res = await setCartItemQuantityAction({ itemId, quantity: qty });
      if (!res.ok) toast.error(res.error);
    });

  const remove = () =>
    startTransition(async () => {
      const res = await removeCartItemAction({ itemId });
      if (!res.ok) toast.error(res.error);
    });

  return (
    <div className="mt-auto flex items-center gap-4">
      <div className="inline-flex items-center rounded-full border border-border">
        <button
          type="button"
          aria-label="Menge verringern"
          disabled={pending}
          onClick={() => update(quantity - 1)}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Menge erhöhen"
          disabled={pending || quantity >= stock}
          onClick={() => update(quantity + 1)}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Entfernen
      </button>
    </div>
  );
}
