import type { CSSProperties } from 'react';

/**
 * Props für gestaffelte Scroll-Reveals (siehe components/shared/reveal.tsx):
 * <div {...reveal(2)} />
 */
export function reveal(index = 0) {
  return {
    'data-reveal': '',
    style: { '--reveal-i': index } as CSSProperties,
  };
}
