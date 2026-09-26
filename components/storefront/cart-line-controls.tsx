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
      <div className="inline-flex items-center rounded-full border-2 border-input">
        <button
          type="button"
          aria-label="Menge verringern"
          disabled={pending}
          onClick={() => update(quantity - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Menge erhöhen"
          disabled={pending || quantity >= stock}
          onClick={() => update(quantity + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Entfernen
      </button>
    </div>
  );
}
