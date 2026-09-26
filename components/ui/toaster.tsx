'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border-2 border-border bg-card text-card-foreground shadow-soft-lg font-sans',
          title: 'font-semibold',
          success: '[&_[data-icon]]:text-success',
          error: 'border-destructive/50 [&_[data-icon]]:text-destructive',
          actionButton: '!bg-primary !text-primary-foreground !rounded-full !font-semibold',
          description: 'text-muted-foreground text-sm',
        },
      }}
    />
  );
}
