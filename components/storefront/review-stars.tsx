import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReviewStars({
  value,
  size = 'md',
  showLabel = false,
  className,
}: {
  value: number; // 0..5, kann auch Halbe sein (z. B. 4.3)
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  const full = Math.floor(value);
  const fraction = value - full;
  const showHalf = fraction >= 0.25 && fraction < 0.75;
  const finalFull = fraction >= 0.75 ? full + 1 : full;

  const dim = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-primary', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < finalFull) {
          return <Star key={i} className={cn(dim, 'fill-current')} aria-hidden />;
        }
        if (showHalf && i === full) {
          return <StarHalf key={i} className={cn(dim, 'fill-current')} aria-hidden />;
        }
        return <Star key={i} className={cn(dim, 'text-muted-foreground/40')} aria-hidden />;
      })}
      <span className="sr-only">{value.toFixed(1)} von 5 Sternen</span>
      {showLabel ? (
        <span className="ml-1 text-sm text-muted-foreground">{value.toFixed(1)}</span>
      ) : null}
    </span>
  );
}
