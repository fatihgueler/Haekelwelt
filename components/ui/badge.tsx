import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-soft text-primary',
        solid: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent text-accent-foreground',
        success: 'bg-success-soft text-success',
        outline: 'border border-input text-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        amigurumi: 'bg-cat-amigurumi-surface text-cat-amigurumi-ink',
        heimdeko: 'bg-cat-heimdeko-surface text-cat-heimdeko-ink',
        accessoires: 'bg-cat-accessoires-surface text-cat-accessoires-ink',
        kinder: 'bg-cat-kinder-surface text-cat-kinder-ink',
        brand: 'bg-primary-soft text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
