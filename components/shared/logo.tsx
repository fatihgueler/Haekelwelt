import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  } as const;
  return (
    <Link
      href="/"
      className={cn(
        'font-serif font-semibold tracking-tight text-foreground transition-colors hover:text-primary',
        sizes[size],
        className,
      )}
    >
      Häkelwelt
    </Link>
  );
}
