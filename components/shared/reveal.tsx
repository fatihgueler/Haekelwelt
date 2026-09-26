'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll-Reveal für alle Elemente mit `data-reveal`.
 *
 * - Ohne JavaScript oder bei „Bewegung reduzieren“ bleibt alles sichtbar
 *   (die versteckende CSS-Regel greift nur unter `.reveal-ready` und nur bei
 *   `prefers-reduced-motion: no-preference`, siehe globals.css).
 * - Nutzt ausschließlich opacity/transform → kein Layout-Shift.
 */
export function RevealObserver() {
  const pathname = usePathname();

  React.useEffect(() => {
    const root = document.documentElement;
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const observeAll = () => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el));
    };

    observeAll();
    root.classList.add('reveal-ready');

    // Neu gerenderte Inhalte (z. B. nach Filterwechsel) ebenfalls beobachten.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
