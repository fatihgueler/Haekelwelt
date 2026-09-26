/**
 * Prüft alle internen Links aus Header, Footer und Mobile-Menü gegen einen
 * laufenden Server. Erlaubt: 200 – oder ein Redirect auf /login (Auth-Gate).
 *
 *   BASE_URL=http://localhost:3000 npm run check:links
 */
import { CORE_CATEGORIES, SERVICE_LINKS } from '../lib/category-theme';

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const AUTH_GATED = ['/konto', '/admin'];

function extractHrefs(html: string, tag: 'header' | 'footer'): string[] {
  const hrefs: string[] = [];
  for (const section of html.matchAll(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, 'g'))) {
    for (const m of section[0].matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]!);
  }
  return hrefs;
}

async function main() {
  const home = await fetch(`${BASE}/`);
  if (!home.ok) throw new Error(`Startseite nicht erreichbar: ${home.status}`);
  const html = await home.text();

  const links = new Set<string>([
    ...extractHrefs(html, 'header'),
    ...extractHrefs(html, 'footer'),
    // Mobile-Menü (wird erst beim Öffnen gerendert) und 404-Seite
    '/produkte',
    ...CORE_CATEGORIES.map((c) => `/kategorie/${c.slug}`),
    ...SERVICE_LINKS.map((l) => l.href),
    '/konto/wunschliste',
    '/konto',
    '/admin',
    '/login',
    '/register',
    '/warenkorb',
    '/checkout',
    '/registrieren',
    '/kasse',
  ]);

  const internal = [...links]
    .filter((h) => h.startsWith('/') && !h.startsWith('//') && !h.startsWith('/_next'))
    .map((h) => h.split('#')[0]!)
    .filter(Boolean);

  let failures = 0;
  for (const path of [...new Set(internal)].sort()) {
    const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    const location = res.headers.get('location') ?? '';
    let ok = res.status === 200;
    let note = '';
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const target = new URL(location, BASE).pathname;
      const gated = AUTH_GATED.some((p) => path.startsWith(p)) && target === '/login';
      // /checkout leitet bei leerem Warenkorb bewusst auf /warenkorb um,
      // /registrieren und /kasse sind Aliasse.
      const intended =
        (path === '/checkout' && target === '/warenkorb') ||
        (path === '/registrieren' && target === '/register') ||
        (path === '/kasse' && target === '/checkout');
      ok = gated || intended;
      note = ` → ${target}${gated ? ' (Auth-Redirect)' : intended ? ' (gewollt)' : ''}`;
    }
    if (!ok) failures++;
    console.warn(`${ok ? '✓' : '✗'} ${res.status} ${path}${note}`);
  }

  console.warn(`\n${new Set(internal).size} Links geprüft, ${failures} Fehler.`);
  if (failures > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
