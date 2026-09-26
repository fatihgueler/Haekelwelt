import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

// Zur Laufzeit rendern, damit die Site-URL aus der Umgebung (Railway) greift.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/konto/', '/checkout/', '/warenkorb'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
