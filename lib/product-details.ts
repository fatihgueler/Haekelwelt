/**
 * Zerlegt eine Produktbeschreibung in Fließtext und Detail-Angaben.
 * Detailzeilen haben die Form „Material: …“, „Maße: …“, „Pflege: …“
 * (siehe prisma/seed.ts). Unbekannte Zeilen bleiben Fließtext.
 */
const DETAIL_LABELS = ['Material', 'Maße', 'Pflege', 'Größe', 'Farbe'] as const;

export type ProductDetail = { label: string; value: string };

export function parseProductDescription(description: string): {
  paragraphs: string[];
  details: ProductDetail[];
} {
  const details: ProductDetail[] = [];
  const textLines: string[] = [];

  for (const line of description.split('\n')) {
    const match = line.match(/^\s*([A-Za-zÄÖÜäöüß]+):\s*(.+)$/);
    const label = match?.[1];
    if (label && match[2] && (DETAIL_LABELS as readonly string[]).includes(label)) {
      details.push({ label, value: match[2].trim() });
    } else {
      textLines.push(line);
    }
  }

  const paragraphs = textLines
    .join('\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return { paragraphs, details };
}
