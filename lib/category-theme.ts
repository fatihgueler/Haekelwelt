/**
 * Kern-Kategorien des Shops inkl. Kategoriefarbe.
 *
 * Die Farbe hängt am Slug (kein DB-Feld, keine Schema-Änderung). Die Liste
 * dient außerdem als Fallback für Navigation, Sitemap und Kategorieseiten,
 * solange die Datenbank (noch) keine Kategorien enthält.
 */

export type CategoryTone = 'amigurumi' | 'heimdeko' | 'accessoires' | 'kinder' | 'brand';

export type CoreCategory = {
  slug: string;
  name: string;
  description: string;
  tone: CategoryTone;
};

export const CORE_CATEGORIES: readonly CoreCategory[] = [
  {
    slug: 'amigurumi',
    name: 'Amigurumi',
    description: 'Kleine gehäkelte Freunde – Tiere und Figuren zum Liebhaben.',
    tone: 'amigurumi',
  },
  {
    slug: 'heimdeko',
    name: 'Heimdeko',
    description: 'Decken, Kissen und Körbe, die dein Zuhause gemütlich machen.',
    tone: 'heimdeko',
  },
  {
    slug: 'accessoires',
    name: 'Accessoires',
    description: 'Mützen, Schals und Taschen aus weichen Naturfasern.',
    tone: 'accessoires',
  },
  {
    slug: 'babys-und-kinder',
    name: 'Babys & Kinder',
    description: 'Sanfte Begleiter und Kuscheliges für die Kleinsten.',
    tone: 'kinder',
  },
];

const toneBySlug: Record<string, CategoryTone> = Object.fromEntries(
  CORE_CATEGORIES.map((c) => [c.slug, c.tone]),
);

export function getCategoryTone(slug: string | undefined | null): CategoryTone {
  return (slug && toneBySlug[slug]) || 'brand';
}

export function getCoreCategory(slug: string): CoreCategory | undefined {
  return CORE_CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Statische Klassen je Farbton (Tailwind braucht vollständige Klassennamen).
 * surface = Pastellfläche, ink = Text/Link auf Fläche & Hintergrund,
 * deco = Illustrationen, dot = kleiner Farbpunkt in Navigation/Filtern.
 */
export const toneClasses: Record<
  CategoryTone,
  { surface: string; surfaceText: string; ink: string; deco: string; dot: string; button: string }
> = {
  amigurumi: {
    surface: 'bg-cat-amigurumi-surface',
    surfaceText: 'text-cat-amigurumi-surface',
    ink: 'text-cat-amigurumi-ink',
    deco: 'text-cat-amigurumi-deco',
    dot: 'bg-cat-amigurumi-deco',
    button: 'bg-cat-amigurumi-ink text-background hover:bg-cat-amigurumi-ink/90',
  },
  heimdeko: {
    surface: 'bg-cat-heimdeko-surface',
    surfaceText: 'text-cat-heimdeko-surface',
    ink: 'text-cat-heimdeko-ink',
    deco: 'text-cat-heimdeko-deco',
    dot: 'bg-cat-heimdeko-deco',
    button: 'bg-cat-heimdeko-ink text-background hover:bg-cat-heimdeko-ink/90',
  },
  accessoires: {
    surface: 'bg-cat-accessoires-surface',
    surfaceText: 'text-cat-accessoires-surface',
    ink: 'text-cat-accessoires-ink',
    deco: 'text-cat-accessoires-deco',
    dot: 'bg-cat-accessoires-deco',
    button: 'bg-cat-accessoires-ink text-background hover:bg-cat-accessoires-ink/90',
  },
  kinder: {
    surface: 'bg-cat-kinder-surface',
    surfaceText: 'text-cat-kinder-surface',
    ink: 'text-cat-kinder-ink',
    deco: 'text-cat-kinder-deco',
    dot: 'bg-cat-kinder-deco',
    button: 'bg-cat-kinder-ink text-background hover:bg-cat-kinder-ink/90',
  },
  brand: {
    surface: 'bg-primary-soft',
    surfaceText: 'text-primary-soft',
    ink: 'text-primary',
    deco: 'text-primary',
    dot: 'bg-primary',
    button: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
};

/** Navigationseinträge (Header, Mobile-Menü) */
export const SERVICE_LINKS = [
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Versand', href: '/versand' },
  { label: 'Kontakt', href: '/kontakt' },
] as const;

/** Wollfarbe je Farbton – z. B. für das Knäuel, das in den Warenkorb hüpft. */
export const toneWool: Record<
  CategoryTone,
  'pfirsich' | 'senf' | 'lavendel' | 'himmelblau' | 'himbeere'
> = {
  amigurumi: 'pfirsich',
  heimdeko: 'senf',
  accessoires: 'lavendel',
  kinder: 'himmelblau',
  brand: 'himbeere',
};
