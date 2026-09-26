import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { reveal } from '@/lib/reveal';
import { absoluteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Häufige Fragen',
  description: 'Antworten zu Versand, Pflege, Bestellung und Rückgabe.',
};

const faqs: { question: string; answer: string }[] = [
  {
    question: 'Wie lange dauert der Versand?',
    answer:
      'Innerhalb Deutschlands 2–4 Werktage, EU-weit 4–8 Werktage. Wir verschicken in der Regel innerhalb eines Werktags nach Zahlungseingang.',
  },
  {
    question: 'Was kostet der Versand?',
    answer:
      'Innerhalb Deutschlands 4,90 € pauschal, gratis ab einem Bestellwert von 50 €. In andere EU-Länder 9,90 € pauschal, gratis ab 80 €.',
  },
  {
    question: 'Wie pflege ich die handgehäkelten Stücke?',
    answer:
      'Wir empfehlen Handwäsche bei maximal 30 °C mit Wollwaschmittel. Trockne die Stücke flach liegend auf einem Handtuch – nicht aufhängen, damit sie sich nicht verziehen.',
  },
  {
    question: 'Sind die Produkte für Babys geeignet?',
    answer:
      'Alle Stücke der Kategorie „Babys & Kinder“ sind aus schadstoffgeprüfter Wolle gefertigt; Augen sind aufgestickt statt als Knopfaugen aufgenäht. Die übrigen Stücke sind nicht spezifisch babyfest – bitte für Kinder unter 3 Jahren nur unter Aufsicht.',
  },
  {
    question: 'Kann ich ein Produkt zurückgeben?',
    answer:
      'Ja, du hast ein 14-tägiges Widerrufsrecht nach Erhalt der Ware. Details findest du in unserer Widerrufsbelehrung.',
  },
  {
    question: 'Sind die Produkte Unikate?',
    answer:
      'Viele sind Einzelstücke, einige Modelle stellen wir in kleinen Stückzahlen her. Auf jeder Produktseite siehst du den aktuellen Lagerbestand.',
  },
  {
    question: 'Macht ihr auch Sonderanfertigungen?',
    answer:
      'Wir nehmen gelegentlich individuelle Aufträge an – zum Beispiel für Hochzeiten oder Babygeschenke. Schreib uns einfach über das Kontaktformular, was du dir vorstellst.',
  },
];

export default function FaqPage() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Service"
        title="Häufig gestellte Fragen"
        tone="accessoires"
        wool="lavendel"
      >
        Antworten zu Versand, Pflege und Rückgabe. Etwas fehlt?{' '}
        <Link href="/kontakt" className="font-semibold underline underline-offset-4">
          Schreib uns
        </Link>
        .
      </PageHeader>

      <div className="container max-w-3xl pt-10">
        <ul className="space-y-3">
          {faqs.map((f, i) => (
            <li key={i} {...reveal(i % 4)}>
              <details className="group rounded-3xl border border-border bg-card p-5 transition-shadow open:shadow-soft sm:p-6">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-300 group-open:rotate-45"
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-pretty leading-relaxed text-foreground/90">{f.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>

      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <link rel="canonical" href={absoluteUrl('/faq')} />
    </div>
  );
}
