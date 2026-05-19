'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { addToCartAction } from '@/actions/cart';

export function AddToCartButton({
  productId,
  disabled,
  size = 'lg',
  label = 'In den Warenkorb',
}: {
  productId: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onAdd = () => {
    startTransition(async () => {
      const res = await addToCartAction({ productId, quantity: 1 });
      if (res.ok) {
        toast.success('Im Warenkorb hinzugefügt.');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled || pending}
      onClick={onAdd}
      className="min-w-[12rem]"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
      {label}
    </Button>
  );
}
