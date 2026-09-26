/**
 * Öffentliche Basis-URL des Shops (ohne abschließenden Slash).
 *
 * Reihenfolge:
 * 1. SITE_URL – zur Laufzeit gelesen (auf dem Server), ideal für Railway
 * 2. NEXT_PUBLIC_SITE_URL – wird von Next.js zur Build-Zeit eingebettet
 * 3. RAILWAY_PUBLIC_DOMAIN – setzt Railway automatisch (nur Hostname)
 * 4. AUTH_URL / NEXTAUTH_URL – ist für Auth.js ohnehin gesetzt
 * 5. http://localhost:3000 – lokale Entwicklung
 */
export function getSiteUrl(): string {
  const candidates = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
  ];

  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      return url.origin;
    } catch {
      // ungültiger Wert → nächsten Kandidaten probieren
    }
  }
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string) {
  return `${getSiteUrl()}/${path.replace(/^\//, '')}`;
}
