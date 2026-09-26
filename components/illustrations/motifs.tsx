import { cn } from '@/lib/utils';

/**
 * Picot-Bordüre als Section-Divider: Wellenkante mit kleinen Picot-Pünktchen.
 * `className` setzt die Farbe über `text-*` (fill = currentColor) – typischerweise
 * die Hintergrundfarbe der folgenden Sektion.
 */
export function PicotDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  const waves = 24;
  const w = 1440 / waves;
  let d = 'M0 24';
  for (let i = 0; i < waves; i++) {
    const x = i * w;
    d += ` Q${x + w / 2} 0 ${x + w} 24`;
  }
  d += ' V40 H0 Z';
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none relative h-6 w-full sm:h-8',
        flip && 'rotate-180',
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path d={d} fill="currentColor" />
        {Array.from({ length: waves }).map((_, i) => (
          <circle key={i} cx={i * w + w / 2} cy={6} r={3.2} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

/**
 * Geschwungene Fadenlinie – verbindet Sektionen optisch. Rein dekorativ.
 */
export function ThreadLine({
  className,
  variant = 'a',
}: {
  className?: string;
  variant?: 'a' | 'b';
}) {
  const d =
    variant === 'a'
      ? 'M0 40 C180 110 320 -10 520 50 S860 140 1040 60 S1320 10 1440 70'
      : 'M0 70 C200 10 360 120 560 60 S900 -10 1080 60 S1340 110 1440 40';
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={cn('pointer-events-none h-16 w-full sm:h-24', className)}
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.5 10"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Kleine Häkelnadel (dekorativ) */
export function CrochetHook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true" focusable="false">
      <rect x="2" y="8" width="96" height="8" rx="4" fill="#D9A86C" />
      <rect x="2" y="8" width="30" height="8" rx="4" fill="currentColor" />
      <path
        d="M98 8 q14 0 14 5 q0 5 -8 5"
        fill="none"
        stroke="#D9A86C"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Granny-Square-Icon (dekorativ), Farben über Props */
export function GrannySquare({
  className,
  colors = ['#E05C88', '#E4A425', '#49AB8E'],
}: {
  className?: string;
  colors?: [string, string, string];
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="60" height="60" rx="10" fill={colors[0]} />
      <rect x="12" y="12" width="40" height="40" rx="7" fill="#FBF8F4" />
      <rect x="18" y="18" width="28" height="28" rx="5" fill={colors[1]} />
      <rect x="26" y="26" width="12" height="12" rx="3" fill={colors[2]} />
    </svg>
  );
}
