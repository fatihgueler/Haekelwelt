import { DiscountType, PrismaClient, TaxRate, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Demo-Seed für Häkelwelt – idempotent (mehrfach ausführbar, gleiches Ergebnis).
 *
 * - 4 Kategorien mit festen Slugs (amigurumi, heimdeko, accessoires, babys-und-kinder)
 * - 12 Demo-Produkte (3 je Kategorie) mit eigenen SVG-Illustrationen aus /public/demo
 * - Test-Accounts + Rabattcodes (NUR Entwicklung)
 *
 * Material, Maße und Pflege stehen als strukturierter Block am Ende der
 * Beschreibung („Material: …“, „Maße: …“, „Pflege: …“) und werden auf der
 * Produktseite als Liste dargestellt (siehe lib/product-details.ts).
 */

const db = new PrismaClient();

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed in NODE_ENV=production. Aborting.');
  process.exit(1);
}

type SeedProduct = {
  slug: string;
  title: string;
  categorySlug: string;
  priceCents: number;
  stock: number;
  weightGrams: number;
  intro: string;
  material: string;
  masse: string;
  pflege: string;
  alt: string;
};

const categories = [
  {
    slug: 'amigurumi',
    name: 'Amigurumi',
    description: 'Kleine gehäkelte Freunde – Tiere und Figuren zum Liebhaben.',
    sortOrder: 1,
  },
  {
    slug: 'heimdeko',
    name: 'Heimdeko',
    description: 'Decken, Kissen und Körbe, die dein Zuhause gemütlich machen.',
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
    description: 'Sanfte Begleiter und Kuscheliges für die Kleinsten.',
    sortOrder: 4,
  },
];

const products: SeedProduct[] = [
  // ---------- Amigurumi ----------
  {
    slug: 'kuschelhase-luna',
    title: 'Kuschelhase „Luna“',
    categorySlug: 'amigurumi',
    priceCents: 4900,
    stock: 3,
    weightGrams: 180,
    intro:
      'Luna hat lange Schlappohren, ein rosa Halstuch und ein Herz für alle, die gern kuscheln. Jede Masche ist von Hand gehäkelt, die Augen sind aufgestickt – ganz ohne Kleinteile.\n\nFür Luna brauchen wir etwa sechs Stunden. Deshalb sieht jeder Hase ein kleines bisschen anders aus.',
    material: '100 % Bio-Baumwolle, Füllung aus Polyester-Kugelfaser (waschbar)',
    masse: 'ca. 26 cm hoch (mit Ohren), 12 cm breit',
    pflege: 'Handwäsche bis 30 °C, liegend trocknen',
    alt: 'Illustration: Kuschelhase Luna aus cremefarbener Baumwolle mit rosa Halstuch',
  },
  {
    slug: 'teddybaer-bruno',
    title: 'Teddybär „Bruno“',
    categorySlug: 'amigurumi',
    priceCents: 5400,
    stock: 1,
    weightGrams: 220,
    intro:
      'Bruno ist ein klassischer Teddy mit runden Ohren, heller Schnauze und einer mintgrünen Fliege. Arme und Beine sind fest angenäht, damit er jede Abenteuerreise mitmacht.\n\nBruno gibt es genau einmal – wenn er weg ist, häkeln wir einen neuen, aber nie denselben.',
    material: 'Baumwolle-Leinen-Mischung (70/30), Sicherheitsfüllung',
    masse: 'ca. 24 cm hoch, 14 cm breit',
    pflege: 'Handwäsche bis 30 °C, nicht in den Trockner',
    alt: 'Illustration: Teddybär Bruno in Karamellbraun mit mintfarbener Fliege',
  },
  {
    slug: 'wal-walter',
    title: 'Kleiner Wal „Walter“',
    categorySlug: 'amigurumi',
    priceCents: 3900,
    stock: 4,
    weightGrams: 120,
    intro:
      'Walter pustet eine kleine Fontäne und lächelt dabei so zufrieden, als hätte er gerade den schönsten Platz im Regal gefunden. Himmelblau mit cremefarbenem Bauch, weich und handlich.\n\nPerfekt als Mitbringsel oder als Schreibtisch-Begleiter.',
    material: '100 % Baumwolle (OEKO-TEX Standard 100), Polyesterfüllung',
    masse: 'ca. 18 cm lang, 11 cm hoch',
    pflege: 'Handwäsche bis 30 °C, liegend trocknen',
    alt: 'Illustration: kleiner Wal Walter in Himmelblau mit cremefarbenem Bauch',
  },
  // ---------- Heimdeko ----------
  {
    slug: 'granny-square-decke-sonnenschein',
    title: 'Granny-Square-Decke „Sonnenschein“',
    categorySlug: 'heimdeko',
    priceCents: 18900,
    stock: 1,
    weightGrams: 1400,
    intro:
      'Sechzig Granny Squares in Senf, Himbeere, Mint, Lavendel und Himmelblau, einzeln gehäkelt und von Hand zusammengefügt. Die Decke wärmt auf dem Sofa und macht gute Laune, sobald man sie sieht.\n\nAn dieser Decke haben wir rund drei Wochen gearbeitet. Es gibt sie nur ein einziges Mal.',
    material: 'Merinowolle (superwash) und Baumwolle, je zur Hälfte',
    masse: 'ca. 120 × 150 cm, Fransen 4 cm',
    pflege: 'Wollwaschgang bis 30 °C, liegend trocknen',
    alt: 'Illustration: bunte Granny-Square-Decke Sonnenschein mit Fransen',
  },
  {
    slug: 'kissenhuelle-maschenglueck',
    title: 'Kissenhülle „Maschenglück“',
    categorySlug: 'heimdeko',
    priceCents: 5900,
    stock: 3,
    weightGrams: 350,
    intro:
      'Eine mintgrüne Kissenhülle mit gehäkelter Blüte in der Mitte und kleinen Holzknöpfen an den Ecken. Die Rückseite hat einen Hotelverschluss, so rutscht nichts.\n\nPasst auf jedes Kissen mit 40 × 40 cm.',
    material: '100 % gekämmte Baumwolle, Knöpfe aus Olivenholz',
    masse: '40 × 40 cm (Füllkissen nicht enthalten)',
    pflege: 'Schonwaschgang bis 30 °C, auf links waschen',
    alt: 'Illustration: mintgrüne Kissenhülle Maschenglück mit Blütenmotiv',
  },
  {
    slug: 'haekelkorb-mia',
    title: 'Häkelkorb „Mia“',
    categorySlug: 'heimdeko',
    priceCents: 3400,
    stock: 5,
    weightGrams: 400,
    intro:
      'Ein fester Korb aus Textilgarn für alles, was gern herumliegt: Wollknäuel, Spielzeug, Pflanzen oder Zeitschriften. Der senfgelbe Rand und die Henkel bringen Farbe ins Regal.\n\nDer Korb steht von allein und behält seine Form.',
    material: 'Recyceltes Textilgarn (Baumwoll-Jersey)',
    masse: 'Ø ca. 24 cm, 20 cm hoch',
    pflege: 'Mit feuchtem Tuch abwischen, bei Bedarf Handwäsche',
    alt: 'Illustration: Häkelkorb Mia in Natur und Senf, gefüllt mit Wollknäueln',
  },
  // ---------- Accessoires ----------
  {
    slug: 'bommelmuetze-cosima',
    title: 'Bommelmütze „Cosima“',
    categorySlug: 'accessoires',
    priceCents: 3900,
    stock: 4,
    weightGrams: 110,
    intro:
      'Weiche Lavendel-Mütze mit breitem Rippenbund und einem dicken rosa Bommel. Sie kratzt nicht und hält auch an windigen Tagen die Ohren warm.\n\nDie Einheitsgröße passt den meisten Erwachsenen (Kopfumfang 54–58 cm).',
    material: 'Alpaka-Merino-Mischung (40/60), Bommel aus Wollresten',
    masse: 'Einheitsgröße, Kopfumfang 54–58 cm',
    pflege: 'Handwäsche kalt mit Wollwaschmittel, liegend trocknen',
    alt: 'Illustration: lavendelfarbene Bommelmütze Cosima mit rosa Bommel',
  },
  {
    slug: 'haekeltasche-mira',
    title: 'Häkeltasche „Mira“',
    categorySlug: 'accessoires',
    priceCents: 6900,
    stock: 2,
    weightGrams: 380,
    intro:
      'Eine helle Umhängetasche mit sechs bunten Granny Squares und einem Riemen aus pflanzlich gegerbtem Leder. Innen gibt es ein Baumwollfutter mit kleiner Innentasche.\n\nIn die Tasche passen Geldbeutel, Handy, Buch und ein Apfel.',
    material: 'Baumwolle, Innenfutter aus Leinen, Lederriemen',
    masse: 'ca. 28 × 24 cm, Riemenlänge 60 cm',
    pflege: 'Punktuell mit feuchtem Tuch reinigen, Leder nicht waschen',
    alt: 'Illustration: cremefarbene Häkeltasche Mira mit bunten Granny Squares und Lederriemen',
  },
  {
    slug: 'loopschal-wolke',
    title: 'Loopschal „Wolke“',
    categorySlug: 'accessoires',
    priceCents: 4900,
    stock: 3,
    weightGrams: 160,
    intro:
      'Ein Loopschal, so leicht wie eine Wolke: Himmelblau und Lavendel im Farbverlauf, locker gehäkelt und sehr weich. Er lässt sich einfach oder doppelt um den Hals legen.\n\nDas Garn ist so weich, dass man ihn auch direkt auf der Haut gern trägt.',
    material: 'Merino-Seide-Mischung (80/20)',
    masse: 'Umfang ca. 140 cm, Breite 25 cm',
    pflege: 'Handwäsche kalt, liegend trocknen, nicht wringen',
    alt: 'Illustration: weicher Loopschal Wolke in Himmelblau und Lavendel',
  },
  // ---------- Babys & Kinder ----------
  {
    slug: 'baby-mobile-mond-und-sterne',
    title: 'Baby-Mobile „Mond & Sterne“',
    categorySlug: 'babys-und-kinder',
    priceCents: 6900,
    stock: 2,
    weightGrams: 260,
    intro:
      'Mond, Sterne, eine Wolke und ein Herz hängen an einem Ring aus Buchenholz und drehen sich ganz langsam. Die sanften Farben beruhigen und laden zum Träumen ein.\n\nWichtig: Das Mobile nur außerhalb der Reichweite deines Kindes aufhängen.',
    material: 'Bio-Baumwolle, Buchenholzring, Baumwollfäden',
    masse: 'Ringdurchmesser 25 cm, Gesamthöhe ca. 55 cm',
    pflege: 'Figuren mit feuchtem Tuch abwischen',
    alt: 'Illustration: Baby-Mobile Mond und Sterne mit Wolke und Herz an einem Holzring',
  },
  {
    slug: 'babyschuhe-erste-schritte',
    title: 'Babyschuhe „Erste Schritte“',
    categorySlug: 'babys-und-kinder',
    priceCents: 2900,
    stock: 6,
    weightGrams: 60,
    intro:
      'Weiche Babyschuhe mit Knopfriegel, damit sie beim Strampeln nicht verloren gehen. Der eine Schuh ist himmelblau, der andere mint – ein Paar, das nicht gleich aussehen muss.\n\nGrößen 0–3, 3–6 und 6–12 Monate. Die Größe gibst du bitte beim Bestellen im Kommentar an.',
    material: '100 % Bio-Baumwolle (GOTS), Holzknöpfe',
    masse: 'Sohlenlänge 9 / 10,5 / 12 cm',
    pflege: 'Handwäsche bis 30 °C, in Form ziehen und liegend trocknen',
    alt: 'Illustration: ein Paar Babyschuhe Erste Schritte in Himmelblau und Mint mit Holzknöpfen',
  },
  {
    slug: 'greifling-elefant-emil',
    title: 'Greifling Elefant „Emil“',
    categorySlug: 'babys-und-kinder',
    priceCents: 2400,
    stock: 5,
    weightGrams: 90,
    intro:
      'Emil ist ein kleiner Elefant mit großen Ohren und einem Ring aus unbehandeltem Ahornholz. Er ist perfekt zum Greifen, Knabbern und Festhalten, und im Bauch versteckt sich eine leise Rassel.\n\nAlle Teile sind fest vernäht, die Augen sind gestickt.',
    material: 'Bio-Baumwolle, Ahornholzring (unbehandelt), Rasselkapsel',
    masse: 'ca. 12 cm hoch, Ring Ø 7 cm',
    pflege: 'Handwäsche bis 30 °C, Holz nur feucht abwischen',
    alt: 'Illustration: Greifling Elefant Emil in Grau-Lavendel mit Holzring',
  },
];

function buildDescription(p: SeedProduct) {
  return `${p.intro}\n\nMaterial: ${p.material}\nMaße: ${p.masse}\nPflege: ${p.pflege}`;
}

async function main() {
  console.warn('Seeding database…');

  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  const cats = await db.category.findMany({ select: { id: true, slug: true } });
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Neuestes Produkt zuerst in „Frisch eingetroffen“ – daher gestaffelte Zeitstempel.
  const now = Date.now();

  for (const [index, p] of products.entries()) {
    const categoryId = bySlug[p.categorySlug];
    if (!categoryId) throw new Error(`Kategorie ${p.categorySlug} fehlt`);

    const images = [
      { url: `/demo/${p.slug}.svg`, alt: p.alt, sortOrder: 0, width: 800, height: 1000 },
      {
        url: `/demo/${p.slug}-detail.svg`,
        alt: `Detailansicht der Maschen von ${p.title}`,
        sortOrder: 1,
        width: 800,
        height: 1000,
      },
    ];

    const data = {
      title: p.title,
      description: buildDescription(p),
      priceCents: p.priceCents,
      stock: p.stock,
      weightGrams: p.weightGrams,
      taxRate: TaxRate.STANDARD,
      isActive: true,
      categoryId,
    };

    const product = await db.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        ...data,
        createdAt: new Date(now - index * 36 * 60 * 60 * 1000),
      },
      update: data,
    });

    // Bilder immer neu setzen, damit ein erneuter Lauf alte URLs ersetzt.
    await db.productImage.deleteMany({ where: { productId: product.id } });
    await db.productImage.createMany({
      data: images.map((img) => ({ ...img, productId: product.id })),
    });
  }

  // Test-Accounts (NICHT für Produktion)
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

  // Demo-Rabattcodes
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

  const [catCount, productCount] = await Promise.all([db.category.count(), db.product.count()]);
  console.warn(`Seed completed: ${catCount} Kategorien, ${productCount} Produkte.`);
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
