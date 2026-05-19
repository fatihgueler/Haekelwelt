'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { toggleWishlistAction } from '@/actions/wishlist';
import { cn } from '@/lib/utils';

export function WishlistButton({
  productId,
  initialInWishlist,
  size = 'md',
  className,
}: {
  productId: string;
  initialInWishlist: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [active, setActive] = React.useState(initialInWishlist);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await toggleWishlistAction({ productId });
      if (!res.ok) {
        if (res.requiresAuth) {
          toast.error(res.error, {
            action: { label: 'Anmelden', onClick: () => router.push('/login') },
          });
        } else {
          toast.error(res.error);
        }
        return;
      }
      setActive(res.inWishlist);
      toast.success(
        res.inWishlist ? 'Zur Wunschliste hinzugefügt.' : 'Von der Wunschliste entfernt.',
      );
    });
  };

  const dim = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? 'Von der Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition-all',
        'hover:border-primary hover:text-primary disabled:opacity-50',
        active && 'border-primary bg-primary/10 text-primary',
        dim,
        className,
      )}
    >
      <Heart className={cn(icon, active && 'fill-current')} />
    </button>
  );
}
