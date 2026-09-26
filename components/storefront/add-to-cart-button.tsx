'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { addToCartAction } from '@/actions/cart';
import { flyToCart } from '@/lib/fly-to-cart';
import type { Wool } from '@/components/illustrations/yarn-ball';
import { cn } from '@/lib/utils';

export function AddToCartButton({
  productId,
  disabled,
  size = 'lg',
  label = 'In den Warenkorb',
  wool = 'himbeere',
  className,
}: {
  productId: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  label?: string;
  wool?: Wool;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const ref = React.useRef<HTMLButtonElement>(null);

  const onAdd = () => {
    startTransition(async () => {
      const res = await addToCartAction({ productId, quantity: 1 });
      if (res.ok) {
        if (ref.current) flyToCart(ref.current, wool);
        toast.success('Liegt im Warenkorb ♥', {
          action: { label: 'Zum Warenkorb', onClick: () => router.push('/warenkorb') },
        });
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Button
      ref={ref}
      type="button"
      size={size}
      disabled={disabled || pending}
      onClick={onAdd}
      aria-busy={pending}
      className={cn('min-w-[12rem]', className)}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <ShoppingBag className="h-4 w-4" aria-hidden />
      )}
      {disabled ? 'Leider vergriffen' : label}
    </Button>
  );
}
