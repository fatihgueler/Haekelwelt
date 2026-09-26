import 'server-only';
import { db } from '@/lib/db';
import { CORE_CATEGORIES, getCategoryTone, type CategoryTone } from '@/lib/category-theme';

export type NavCategory = {
  slug: string;
  name: string;
  description: string | null;
  tone: CategoryTone;
};

/**
 * Kategorien für Navigation, Footer und Kacheln. Kommen aus der DB; fehlen dort
 * Kern-Kategorien (z. B. frisch aufgesetzte Datenbank), werden sie aus der
 * statischen Konfiguration ergänzt, damit keine Links ins Leere zeigen.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  let fromDb: { slug: string; name: string; description: string | null }[] = [];
  try {
    fromDb = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true, description: true },
    });
  } catch {
    // DB nicht erreichbar → nur Kern-Kategorien
  }

  const known = new Set(fromDb.map((c) => c.slug));
  const merged = [
    ...fromDb,
    ...CORE_CATEGORIES.filter((c) => !known.has(c.slug)).map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
    })),
  ];

  return merged.map((c) => ({ ...c, tone: getCategoryTone(c.slug) }));
}
