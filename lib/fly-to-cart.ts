'use client';

import { WOOL, type Wool } from '@/components/illustrations/yarn-ball';

/**
 * Lässt ein kleines Wollknäuel vom Auslöser zum Warenkorb-Icon hüpfen
 * ([data-cart-target]). Nur transform/opacity per Web Animations API.
 * Bei „Bewegung reduzieren“ passiert nichts – das Badge aktualisiert sich trotzdem.
 */
export function flyToCart(from: HTMLElement, wool: Wool = 'himbeere') {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = document.querySelector<HTMLElement>('[data-cart-target]');
  if (!target || typeof target.animate !== 'function') return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 28;
  const startX = a.left + a.width / 2 - size / 2;
  const startY = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - startX;
  const dy = b.top + b.height / 2 - size / 2 - startY;

  const c = WOOL[wool];
  // Äußeres Element: horizontale Bewegung (linear), inneres: vertikaler Bogen.
  const outer = document.createElement('div');
  outer.setAttribute('aria-hidden', 'true');
  Object.assign(outer.style, {
    position: 'fixed',
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: '60',
    pointerEvents: 'none',
  });
  const inner = document.createElement('div');
  inner.innerHTML = `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><circle cx="50" cy="50" r="46" fill="${c.base}"/><g fill="none" stroke-linecap="round"><ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(-25 50 50)" stroke="${c.dark}" stroke-opacity=".5" stroke-width="5"/><ellipse cx="50" cy="50" rx="46" ry="30" transform="rotate(-10 50 50)" stroke="${c.dark}" stroke-opacity=".45" stroke-width="5"/><ellipse cx="50" cy="50" rx="30" ry="46" transform="rotate(20 50 50)" stroke="${c.light}" stroke-opacity=".8" stroke-width="5"/></g></svg>`;
  outer.appendChild(inner);
  document.body.appendChild(outer);

  const duration = 720;
  const lift = Math.min(160, Math.abs(dy) * 0.5 + 80);

  outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], {
    duration,
    easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
    fill: 'forwards',
  });
  const arc = inner.animate(
    [
      { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${-lift}px) scale(1.15) rotate(200deg)`, opacity: 1, offset: 0.4 },
      { transform: `translateY(${dy}px) scale(0.55) rotate(420deg)`, opacity: 0.9 },
    ],
    { duration, easing: 'cubic-bezier(0.33, 0, 0.2, 1)', fill: 'forwards' },
  );

  arc.onfinish = () => {
    outer.remove();
    target.classList.remove('cart-bounce');
    // Reflow erzwingen, damit die Bounce-Animation erneut startet.
    void target.offsetWidth;
    target.classList.add('cart-bounce');
  };
}
