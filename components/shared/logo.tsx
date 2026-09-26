import Link from 'next/link';
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: { text: 'text-xl', ball: 'h-6 w-6' },
    md: { text: 'text-2xl', ball: 'h-7 w-7' },
    lg: { text: 'text-3xl', ball: 'h-9 w-9' },
  } as const;
  return (
    <Link
      href="/"
      aria-label="Häkelwelt – zur Startseite"
      className={cn(
        'group inline-flex items-center gap-2 rounded-full font-serif font-semibold tracking-tight text-foreground transition-colors hover:text-primary',
        sizes[size].text,
        className,
      )}
    >
      <YarnBall
        wool="himbeere"
        className={cn(
          'shrink-0 transition-transform duration-500 ease-soft motion-safe:group-hover:rotate-[200deg]',
          sizes[size].ball,
        )}
      />
      <span>Häkelwelt</span>
    </Link>
  );
}
