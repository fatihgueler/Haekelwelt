import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { CORE_CATEGORIES } from '@/lib/category-theme';
import { getSiteUrl } from '@/lib/site-url';

// Zur Laufzeit rendern, damit die Site-URL aus der Umgebung (Railway) greift
// und neue Produkte ohne Rebuild auftauchen.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/produkte`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/ueber-uns`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/kontakt`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/versand`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/impressum`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/datenschutz`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/agb`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/widerruf`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  let categorySlugs: { slug: string; updatedAt?: Date }[] = CORE_CATEGORIES.map((c) => ({
    slug: c.slug,
  }));
  let products: { slug: string; updatedAt: Date }[] = [];

  try {
    const [dbProducts, dbCategories] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
    products = dbProducts;
    const known = new Set(dbCategories.map((c) => c.slug));
    categorySlugs = [...dbCategories, ...categorySlugs.filter((c) => !known.has(c.slug))];
  } catch {
    // DB nicht erreichbar: statische Routen + Kern-Kategorien
  }

  return [
    ...staticRoutes,
    ...categorySlugs.map((c) => ({
      url: `${base}/kategorie/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${base}/produkte/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
