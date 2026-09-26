import { YarnBallShape, WOOL } from './yarn-ball';

/**
 * Hero-Komposition: Wollknäuel, Häkelnadel, Amigurumi-Hase und -Wal.
 * Rein dekorativ; Bewegung nur bei `prefers-reduced-motion: no-preference`
 * (Tailwind `motion-safe:`), animiert werden ausschließlich transforms.
 */
export function HeroArt({ className }: { className?: string }) {
  const cream = '#F7F1EA';
  const ink = '#2D211B';
  const svgBox = '[transform-box:fill-box] origin-center';
  return (
    <svg
      viewBox="0 0 600 680"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <pattern id="hero-granny" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect
            x="8"
            y="8"
            width="40"
            height="40"
            rx="6"
            fill="none"
            stroke="#fff"
            strokeOpacity=".55"
            strokeWidth="3"
          />
          <rect x="18" y="18" width="20" height="20" rx="4" fill="#fff" fillOpacity=".35" />
        </pattern>
        <pattern id="hero-stitch" width="18" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M3 3 L9 12 L15 3"
            fill="none"
            stroke="#fff"
            strokeOpacity=".3"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
        <clipPath id="hero-blob">
          <path d="M300 30 C430 20 560 90 575 240 C590 380 560 520 450 600 C350 670 190 660 105 580 C20 500 10 360 40 240 C75 110 170 40 300 30 Z" />
        </clipPath>
        <clipPath id="hero-bunny-body">
          <ellipse cx="450" cy="470" rx="92" ry="100" />
        </clipPath>
        <clipPath id="hero-bunny-head">
          <circle cx="450" cy="340" r="78" />
        </clipPath>
        <clipPath id="hero-whale">
          <path d="M60 210 C60 150 120 120 180 132 C232 142 255 180 255 215 C255 265 205 292 158 292 C104 292 60 262 60 210 Z" />
        </clipPath>
      </defs>

      {/* Hintergrund-Fläche mit Granny-Square-Textur */}
      <g clipPath="url(#hero-blob)">
        <rect width="600" height="680" style={{ fill: 'hsl(var(--primary-soft, 340 75% 91%))' }} />
        <rect
          width="600"
          height="680"
          fill="url(#hero-granny)"
          className="opacity-70 dark:opacity-15"
        />
      </g>

      {/* Faden, der aus dem Bild hinausläuft (verbindet zur nächsten Sektion) */}
      <path
        d="M300 560 C360 640 470 640 520 600 C570 560 610 610 640 680"
        fill="none"
        stroke={WOOL.himbeere.base}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="1 0"
      />

      {/* Wal – schwebt oben links */}
      <g className={`${svgBox} motion-safe:animate-bob-slow`}>
        <path
          d="M230 230 C262 210 280 180 276 150 C292 164 312 168 322 162 C312 190 290 212 258 228 C278 238 292 256 294 276 C270 262 250 252 230 252 Z"
          fill={WOOL.himmelblau.base}
        />
        <path
          d="M60 210 C60 150 120 120 180 132 C232 142 255 180 255 215 C255 265 205 292 158 292 C104 292 60 262 60 210 Z"
          fill={WOOL.himmelblau.base}
        />
        <g clipPath="url(#hero-whale)">
          <rect x="40" y="110" width="240" height="200" fill="url(#hero-stitch)" />
          <path
            d="M70 240 C100 290 220 300 250 235 C230 280 190 292 158 292 C110 292 78 270 70 240 Z"
            fill={cream}
          />
        </g>
        <ellipse cx="112" cy="200" rx="6.5" ry="8.5" fill={ink} />
        <circle cx="114" cy="197" r="2.2" fill="#fff" />
        <ellipse cx="96" cy="226" rx="11" ry="7" fill={WOOL.himbeere.light} />
        <path
          d="M122 232 Q138 242 152 232"
          fill="none"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[-22, 0, 22].map((dx) => (
          <path
            key={dx}
            d={`M${170 + dx} 128 q${dx * 0.8} -28 ${dx * 1.3} -52`}
            fill="none"
            stroke={WOOL.himmelblau.light}
            strokeWidth="7"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Senf-Knäuel – wippt oben rechts */}
      <g className={`${svgBox} motion-safe:animate-bob`}>
        <YarnBallShape cx={475} cy={140} r={56} wool="senf" tail={false} />
      </g>

      {/* Hase – sitzt rechts */}
      <g>
        {[
          { x: 418, rot: -12 },
          { x: 482, rot: 12 },
        ].map(({ x, rot }) => (
          <g key={x} transform={`rotate(${rot} ${x} 300)`}>
            <rect x={x - 24} y={170} width="48" height="140" rx="24" fill={cream} />
            <rect x={x - 11} y={192} width="22" height="100" rx="11" fill={WOOL.himbeere.light} />
          </g>
        ))}
        <ellipse cx="450" cy="470" rx="92" ry="100" fill={cream} />
        <g clipPath="url(#hero-bunny-body)">
          <rect x="350" y="360" width="200" height="220" fill="url(#hero-stitch)" />
          <ellipse cx="450" cy="480" rx="52" ry="64" fill={WOOL.himbeere.light} />
        </g>
        <circle cx="450" cy="340" r="78" fill={cream} />
        <g clipPath="url(#hero-bunny-head)">
          <rect x="370" y="260" width="160" height="160" fill="url(#hero-stitch)" />
        </g>
        <ellipse cx="422" cy="338" rx="6.5" ry="8.5" fill={ink} />
        <ellipse cx="478" cy="338" rx="6.5" ry="8.5" fill={ink} />
        <circle cx="424" cy="335" r="2.2" fill="#fff" />
        <circle cx="480" cy="335" r="2.2" fill="#fff" />
        <ellipse cx="406" cy="362" rx="11" ry="7" fill={WOOL.himbeere.light} />
        <ellipse cx="494" cy="362" rx="11" ry="7" fill={WOOL.himbeere.light} />
        <path
          d="M444 354 Q450 360 456 354"
          fill={WOOL.himbeere.base}
          stroke={WOOL.himbeere.base}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M438 368 Q450 378 462 368"
          fill="none"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M414 410 Q450 428 486 410 L492 424 Q450 446 408 424Z" fill={WOOL.himbeere.base} />
        <circle cx="450" cy="428" r="8" fill={WOOL.himbeere.dark} />
        <ellipse cx="400" cy="566" rx="40" ry="24" fill={cream} />
        <ellipse cx="500" cy="566" rx="40" ry="24" fill={cream} />
      </g>

      {/* Großes Himbeer-Knäuel mit Häkelnadel – rollt ganz langsam */}
      <g>
        <g className={`${svgBox} motion-safe:animate-spin-slower`}>
          <YarnBallShape cx={235} cy={470} r={125} wool="himbeere" tail={false} />
        </g>
        <g transform="rotate(-32 235 470)">
          <rect x="70" y="462" width="340" height="16" rx="8" fill="#D9A86C" />
          <rect x="70" y="462" width="100" height="16" rx="8" fill={WOOL.senf.dark} />
          <path
            d="M410 462 q20 0 20 8 q0 8 -12 8"
            fill="none"
            stroke="#D9A86C"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Kleine Knäuel unten */}
      <g className={`${svgBox} motion-safe:animate-bob-slow`}>
        <YarnBallShape cx={88} cy={600} r={40} wool="mint" tail={false} />
      </g>
      <g className={`${svgBox} motion-safe:animate-bob`} style={{ animationDelay: '-2.5s' }}>
        <YarnBallShape cx={560} cy={610} r={34} wool="lavendel" tail={false} />
      </g>
    </svg>
  );
}
