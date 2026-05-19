import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/produkte`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/impressum`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/datenschutz`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/agb`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${base}/widerruf`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({
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
  } catch {
    // DB nicht erreichbar (z. B. build ohne DATABASE_URL): nur statische Routen
    return staticRoutes;
  }
}
