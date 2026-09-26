/**
 * Prüft die WCAG-2.1-Kontraste aller relevanten Token-Paare aus app/globals.css
 * – für Light (:root) und Dark (.dark). Beendet sich mit Exit-Code 1, sobald ein
 * Paar die Mindestanforderung verfehlt.
 *
 *   npm run check:contrast
 *
 * Text: 4,5:1 · große Schrift & UI-Komponenten: 3:1
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Tokens = Record<string, string>;

const css = readFileSync(resolve('app/globals.css'), 'utf8');

function block(selector: string): Tokens {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Block ${selector} nicht gefunden`);
  const end = css.indexOf('}', start);
  const body = css.slice(start, end);
  const tokens: Tokens = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens[m[1]!] = m[2]!.trim();
  }
  return tokens;
}

const light = block(':root');
const dark = { ...light, ...block('.dark') };

function resolveToken(tokens: Tokens, name: string, depth = 0): string {
  const raw = tokens[name];
  if (!raw) throw new Error(`Token --${name} fehlt`);
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  if (ref && depth < 10) return resolveToken(tokens, ref[1]!, depth + 1);
  return raw;
}

function hslToRgb(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.replace(/%/g, '').split(/\s+/).map(Number) as [number, number, number];
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: string, b: string) {
  const la = luminance(hslToRgb(a));
  const lb = luminance(hslToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// [Vordergrund, Hintergrund, Mindestwert, Beschreibung]
const TEXT = 4.5;
const UI = 3;
const pairs: [string, string, number, string][] = [
  ['foreground', 'background', TEXT, 'Fließtext'],
  ['foreground', 'card', TEXT, 'Text auf Karte'],
  ['foreground', 'secondary', TEXT, 'Text auf Sand-Fläche'],
  ['foreground', 'muted', TEXT, 'Text auf Muted'],
  ['muted-foreground', 'background', TEXT, 'Sekundärtext'],
  ['muted-foreground', 'card', TEXT, 'Sekundärtext auf Karte'],
  ['muted-foreground', 'secondary', TEXT, 'Sekundärtext auf Sand'],
  ['muted-foreground', 'muted', TEXT, 'Sekundärtext auf Muted'],
  ['card-foreground', 'card', TEXT, 'Karte'],
  ['popover-foreground', 'popover', TEXT, 'Popover'],
  ['primary', 'background', TEXT, 'Links/Eyebrows'],
  ['primary', 'card', TEXT, 'Links auf Karte'],
  ['primary', 'secondary', TEXT, 'Links auf Sand'],
  ['primary', 'primary-soft', TEXT, 'Secondary-Button / Badge'],
  ['primary-foreground', 'primary', TEXT, 'Primary-Button'],
  ['secondary-foreground', 'secondary', TEXT, 'Secondary'],
  ['accent-foreground', 'accent', TEXT, 'Accent-Fläche'],
  ['success', 'background', TEXT, 'Erfolgstext'],
  ['success', 'success-soft', TEXT, 'Erfolg auf Mint-Fläche'],
  ['success-foreground', 'success', TEXT, 'Erfolgs-Button'],
  ['foreground', 'success-soft', TEXT, 'Text auf Mint-Fläche'],
  ['destructive', 'background', TEXT, 'Fehlertext'],
  ['destructive', 'card', TEXT, 'Fehlertext auf Karte'],
  ['destructive-foreground', 'destructive', TEXT, 'Destructive-Button'],
  ['input', 'background', UI, 'Formularrahmen'],
  ['input', 'card', UI, 'Formularrahmen auf Karte'],
  ['ring', 'background', UI, 'Fokusring'],
  ['ring', 'card', UI, 'Fokusring auf Karte'],
];

for (const cat of ['amigurumi', 'heimdeko', 'accessoires', 'kinder']) {
  pairs.push(
    [`cat-${cat}-ink`, `cat-${cat}-surface`, TEXT, `Kategorie ${cat}: Link/Badge auf Fläche`],
    ['foreground', `cat-${cat}-surface`, TEXT, `Kategorie ${cat}: Text auf Fläche`],
    ['muted-foreground', `cat-${cat}-surface`, TEXT, `Kategorie ${cat}: Sekundärtext auf Fläche`],
    [`cat-${cat}-ink`, 'background', TEXT, `Kategorie ${cat}: Text auf Hintergrund`],
    ['background', `cat-${cat}-ink`, TEXT, `Kategorie ${cat}: Button`],
  );
}

let failures = 0;
for (const [mode, tokens] of [
  ['Light', light],
  ['Dark', dark],
] as const) {
  console.warn(`\n${mode}`);
  console.warn('-'.repeat(78));
  for (const [fg, bg, min, label] of pairs) {
    const r = ratio(resolveToken(tokens, fg), resolveToken(tokens, bg));
    const ok = r >= min;
    if (!ok) failures++;
    console.warn(
      `${ok ? '✓' : '✗'} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} auf ${bg}  – ${label}`,
    );
  }
}

console.warn(`\n${pairs.length * 2} Paare geprüft, ${failures} Fehler.`);
if (failures > 0) process.exit(1);
