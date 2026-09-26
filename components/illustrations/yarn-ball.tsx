import { useId } from 'react';

export type Wool = 'himbeere' | 'senf' | 'mint' | 'lavendel' | 'pfirsich' | 'himmelblau';

/** Wollfarben (Stufen 400 / 700 / 100) – siehe docs/design-konzept.md */
export const WOOL: Record<Wool, { base: string; dark: string; light: string }> = {
  himbeere: { base: '#E05C88', dark: '#9D254D', light: '#F9D7E2' },
  senf: { base: '#E4A425', dark: '#77540D', light: '#FAE5BD' },
  mint: { base: '#49AB8E', dark: '#145D47', light: '#CBEBE2' },
  lavendel: { base: '#987ACD', dark: '#604096', light: '#E4DAF6' },
  pfirsich: { base: '#ED865A', dark: '#8F3D19', light: '#FCD9CA' },
  himmelblau: { base: '#4BA1D2', dark: '#16587E', light: '#CFE8F7' },
};

/**
 * Wollknäuel als SVG-Gruppe (für den Einsatz innerhalb eines <svg>).
 * Mittelpunkt (cx, cy), Radius r.
 */
export function YarnBallShape({
  cx,
  cy,
  r,
  wool,
  tail = true,
}: {
  cx: number;
  cy: number;
  r: number;
  wool: Wool;
  tail?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const c = WOOL[wool];
  return (
    <g>
      <clipPath id={`yb-${id}`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={c.base} />
      <g clipPath={`url(#yb-${id})`} fill="none" strokeLinecap="round">
        {[-35, -20, -5, 10, 25].map((a, i) => (
          <ellipse
            key={`d${a}`}
            cx={cx}
            cy={cy}
            rx={r * 1.05}
            ry={r * (0.32 + 0.08 * i)}
            transform={`rotate(${a} ${cx} ${cy})`}
            stroke={c.dark}
            strokeOpacity={0.45}
            strokeWidth={Math.max(2, r * 0.05)}
          />
        ))}
        {[60, 75, 90].map((a, i) => (
          <ellipse
            key={`l${a}`}
            cx={cx}
            cy={cy}
            rx={r * 1.02}
            ry={r * (0.45 + 0.12 * i)}
            transform={`rotate(${a} ${cx} ${cy})`}
            stroke={c.light}
            strokeOpacity={0.75}
            strokeWidth={Math.max(2, r * 0.045)}
          />
        ))}
      </g>
      {tail ? (
        <path
          d={`M${cx + r * 0.7} ${cy + r * 0.72} q${r * 0.5} ${r * 0.35} ${r * 0.95} ${r * 0.1} t${r * 0.9} ${r * 0.2}`}
          fill="none"
          stroke={c.base}
          strokeWidth={Math.max(3, r * 0.07)}
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
}

/** Eigenständiges Wollknäuel-Icon (dekorativ). */
export function YarnBall({
  wool,
  className,
  tail = false,
}: {
  wool: Wool;
  className?: string;
  tail?: boolean;
}) {
  return (
    <svg
      viewBox={tail ? '0 0 140 110' : '0 0 100 100'}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <YarnBallShape cx={50} cy={50} r={44} wool={wool} tail={tail} />
    </svg>
  );
}
