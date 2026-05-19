import { DiscountType, PrismaClient, TaxRate, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed in NODE_ENV=production. Aborting.');
  process.exit(1);
}

// Lizenzfreie Bilder aus Unsplash. Für den produktiven Shop durch echte
// Produktfotos der Verkäuferin ersetzen (Bilder enthalten möglicherweise
// abgebildete Personen oder Markenartikel, die wir nicht weiterverkaufen).
const IMG = (id: string, alt: string) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`,
  alt,
});

async function main() {
  console.warn('Seeding database…');

  const categories = [
    {
      slug: 'amigurumi',
      name: 'Amigurumi',
      description: 'Liebevoll gehäkelte Tiere, Figuren und Freunde fürs Leben.',
      sortOrder: 1,
    },
    {
      slug: 'heimdeko',
      name: 'Heimdeko',
      description: 'Decken, Kissen und Wandobjekte für ein warmes Zuhause.',
      sortOrder: 2,
    },
    {
      slug: 'accessoires',
      name: 'Accessoires',
      description: 'Mützen, Schals und Taschen aus weichen Naturfasern.',
      sortOrder: 3,
    },
    {
      slug: 'babys-und-kinder',
      name: 'Babys & Kinder',
      description: 'Sanfte Begleiter und kuschelige Kleinigkeiten für die Kleinsten.',
      sortOrder: 4,
    },
  ];

  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }

  const cats = await db.category.findMany();
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // 12 Produkte über 4 Kategorien
  const products = [
    {
      slug: 'kuschelhase-luna',
      title: 'Kuschelhase Luna',
      description:
        'Ein zarter Häschen-Freund aus weicher Baumwolle. Jeder Hase wird einzeln gehäkelt und mit antiallergener Füllung bestückt – perfekt zum Schmusen, Spielen oder Verschenken.\n\nHöhe: ca. 22 cm. Augen aus aufgenähter Filz-Applikation (keine Knopfaugen, sicher für Babys).',
      priceCents: 4900,
      stock: 3,
      categorySlug: 'amigurumi',
      image: IMG('photo-1602250916380-2c8bf94b96fc', 'Kuschelhase aus Baumwolle in Rosé'),
    },
    {
      slug: 'amigurumi-fuchs-finja',
      title: 'Amigurumi Fuchs Finja',
      description:
        'Finja, die kleine Häkelfüchsin, mit buschigem Schwanz und freundlichem Lächeln. Ein verspielter Begleiter, der jeden Tag heller macht.',
      priceCents: 5400,
      stock: 1,
      categorySlug: 'amigurumi',
      image: IMG('photo-1582719471384-894fbb16e074', 'Fuchs Amigurumi in Orange und Weiß'),
    },
    {
      slug: 'baeren-paar-pino-pina',
      title: 'Bären-Paar Pino & Pina',
      description:
        'Zwei kleine Bären, die zusammengehören – aber auch einzeln erhältlich sind. Mit kleinen Holz-Knöpfen und gewachsten Garnschleifen.',
      priceCents: 6900,
      stock: 2,
      categorySlug: 'amigurumi',
      image: IMG('photo-1564466809058-bf4114d55352', 'Häkelbären in Beige'),
    },

    {
      slug: 'granny-square-decke-herbst',
      title: 'Granny-Square-Decke „Herbst"',
      description:
        'Eine Patchwork-Decke aus 100 Granny Squares in Tönen von Senf, Terracotta und Salbei. Wärmt an kühlen Abenden und ist ein echtes Schmuckstück fürs Sofa.\n\nMaße: ca. 150 × 180 cm. Material: 100 % Merinowolle.',
      priceCents: 24900,
      stock: 1,
      categorySlug: 'heimdeko',
      image: IMG('photo-1583845112203-29329902332e', 'Granny-Square-Decke in Herbstfarben'),
    },
    {
      slug: 'kissenhuelle-rippenstrick',
      title: 'Kissenhülle Rippenstrick',
      description:
        'Strukturierte Häkelhülle mit Rippenmuster und Holzknöpfen, passt auf jedes 40×40-cm-Kissen.',
      priceCents: 6900,
      stock: 4,
      categorySlug: 'heimdeko',
      image: IMG('photo-1493663284031-b7e3aefcae8e', 'Beige Kissenhülle aus Wolle'),
    },
    {
      slug: 'wandbehang-sonnenaufgang',
      title: 'Wandbehang „Sonnenaufgang"',
      description:
        'Boho-Wandbehang aus Naturbaumwolle mit gehäkeltem Sonnenmotiv und Treibholz-Stab. Ein ruhiger Blickfang fürs Schlaf- oder Wohnzimmer.',
      priceCents: 7900,
      stock: 2,
      categorySlug: 'heimdeko',
      image: IMG('photo-1616627988032-21b2cdc8f06b', 'Boho-Wandbehang in Beige'),
    },

    {
      slug: 'wollmuetze-cosima',
      title: 'Wollmütze „Cosima"',
      description:
        'Weiche Mütze aus Alpaka-Mischgarn, Innenfutter aus Baumwolle. In Einheitsgröße, angenehm warm und kratzfrei.',
      priceCents: 3900,
      stock: 5,
      categorySlug: 'accessoires',
      image: IMG('photo-1576566588028-4147f3842f27', 'Beige Wollmütze'),
    },
    {
      slug: 'umhaengetasche-mira',
      title: 'Umhängetasche „Mira"',
      description:
        'Stylische Häkeltasche mit Leder-Trageriemen. Innenfutter aus festem Baumwollstoff mit Reißverschlusstasche. Maße: ca. 28 × 22 cm.',
      priceCents: 8900,
      stock: 2,
      categorySlug: 'accessoires',
      image: IMG('photo-1591561954557-26941169b49e', 'Häkeltasche in Naturweiß'),
    },
    {
      slug: 'schal-waldspaziergang',
      title: 'Schal „Waldspaziergang"',
      description:
        'Langer Schal in Moos- und Erdtönen, gehäkelt mit lockerem Stäbchen-Muster. Hält warm, ohne aufzutragen.',
      priceCents: 5900,
      stock: 3,
      categorySlug: 'accessoires',
      image: IMG('photo-1520903920243-00d872a2d1c9', 'Grüner Wollschal'),
    },

    {
      slug: 'baby-mobile-mond-und-sterne',
      title: 'Baby-Mobile „Mond & Sterne"',
      description:
        'Sanft schaukelndes Mobile mit Mond, Wolken und kleinen Sternen aus Baumwolle. Perfekt über dem Babybett – schadstoffgeprüfte Materialien.',
      priceCents: 6900,
      stock: 2,
      categorySlug: 'babys-und-kinder',
      image: IMG('photo-1519689680058-324335c77eba', 'Baby-Mobile aus Häkelfiguren'),
    },
    {
      slug: 'babyschuhe-erste-schritte',
      title: 'Babyschuhe „Erste Schritte"',
      description:
        'Weiche Babyschuhe für die ersten Krabbelversuche. 100 % Baumwolle, Größen 0–3, 3–6 und 6–9 Monate verfügbar (bitte beim Bestellen vermerken).',
      priceCents: 2900,
      stock: 5,
      categorySlug: 'babys-und-kinder',
      image: IMG('photo-1522771739844-6a9f6d5f14af', 'Babyschuhe in Pastellfarben'),
    },
    {
      slug: 'kuscheltier-elefant-emil',
      title: 'Kuscheltier Elefant „Emil"',
      description:
        'Großer Häkelelefant für lange Freundschaften. Geprüfte Füllung, alle Augen aufgestickt – sicher für Kinder ab 0 Monaten.',
      priceCents: 5900,
      stock: 3,
      categorySlug: 'babys-und-kinder',
      image: IMG('photo-1620207418302-439b387441b0', 'Häkelelefant Emil in Grau'),
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        taxRate: TaxRate.STANDARD,
        categoryId: bySlug[p.categorySlug]!,
        images: { create: { ...p.image, sortOrder: 0 } },
      },
      update: {
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        categoryId: bySlug[p.categorySlug]!,
      },
    });
  }

  // Admin + Test-Kunde (NICHT für Produktion)
  const adminEmail = 'admin@haekelwelt.local';
  const adminPasswordHash = await bcrypt.hash('Admin123!Admin', 12);
  await db.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: 'Häkelwelt Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
    update: { passwordHash: adminPasswordHash, role: UserRole.ADMIN },
  });

  const customerEmail = 'kunde@haekelwelt.local';
  const customerPasswordHash = await bcrypt.hash('Kunde123!Kunde', 12);
  await db.user.upsert({
    where: { email: customerEmail },
    create: {
      email: customerEmail,
      name: 'Mira Mustermann',
      passwordHash: customerPasswordHash,
      role: UserRole.USER,
    },
    update: { passwordHash: customerPasswordHash },
  });

  // Demo-Rabattcodes (Phase 2)
  await db.discountCode.upsert({
    where: { code: 'WILLKOMMEN10' },
    create: {
      code: 'WILLKOMMEN10',
      description: '10 % Willkommensrabatt für Neukunden.',
      type: DiscountType.PERCENT,
      value: 10,
      minSubtotalCents: 3000,
      maxRedemptions: 100,
      isActive: true,
    },
    update: {},
  });
  await db.discountCode.upsert({
    where: { code: 'FRUEHLING5' },
    create: {
      code: 'FRUEHLING5',
      description: '5 € Frühlings-Rabatt.',
      type: DiscountType.FIXED,
      value: 500,
      minSubtotalCents: 5000,
      maxRedemptions: 50,
      isActive: true,
    },
    update: {},
  });

  console.warn('Seed completed.');
  console.warn(`Admin login:    ${adminEmail} / Admin123!Admin`);
  console.warn(`Customer login: ${customerEmail} / Kunde123!Kunde`);
  console.warn('Discount codes: WILLKOMMEN10 (10 %, min 30 €), FRUEHLING5 (5 € fix, min 50 €)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
