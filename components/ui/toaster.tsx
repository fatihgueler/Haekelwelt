'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl border border-border bg-card text-card-foreground shadow-soft-lg',
          title: 'font-medium',
          description: 'text-muted-foreground text-sm',
        },
      }}
    />
  );
}
