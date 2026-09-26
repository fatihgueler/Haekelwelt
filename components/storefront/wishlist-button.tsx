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
  // Zähler statt Boolean, damit der Herz-Pop bei jedem Klick neu startet.
  const [popKey, setPopKey] = React.useState(0);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await toggleWishlistAction({ productId });
      if (!res.ok) {
        if (res.requiresAuth) {
          toast.error('Melde dich kurz an, dann merken wir uns dein Lieblingsstück.', {
            action: { label: 'Anmelden', onClick: () => router.push('/login') },
          });
        } else {
          toast.error(res.error);
        }
        return;
      }
      setActive(res.inWishlist);
      if (res.inWishlist) setPopKey((k) => k + 1);
      toast.success(res.inWishlist ? 'Gemerkt! ♥' : 'Von der Wunschliste entfernt.');
    });
  };

  const dim = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? 'Von der Wunschliste entfernen' : 'Auf die Wunschliste'}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full border-2 bg-card/95 text-foreground shadow-soft transition-colors',
        'hover:border-primary hover:text-primary disabled:opacity-60',
        active ? 'border-primary text-primary' : 'border-transparent',
        dim,
        className,
      )}
    >
      <Heart
        key={popKey}
        className={cn(icon, active && 'fill-current', active && popKey > 0 && 'heart-pop')}
        aria-hidden
      />
      {popKey > 0 && active ? (
        <span key={`p${popKey}`} aria-hidden className="pointer-events-none absolute inset-0">
          {[-14, 0, 14].map((dx, i) => (
            <Heart
              key={dx}
              className="absolute left-[calc(50%-5px)] top-[calc(50%-5px)] h-2.5 w-2.5 fill-current text-primary opacity-0 motion-safe:animate-[float-heart_700ms_ease-out_forwards]"
              style={{ '--dx': `${dx}px`, animationDelay: `${i * 60}ms` } as React.CSSProperties}
            />
          ))}
        </span>
      ) : null}
    </button>
  );
}
