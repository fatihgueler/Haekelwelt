import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
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
      'Alle Stücke der Kategorie „Babys & Kinder" sind aus schadstoffgeprüfter Wolle gefertigt; Augen sind aufgestickt statt als Knopfaugen aufgenäht. Die übrigen Stücke sind nicht spezifisch babyfest – bitte für Kinder unter 3 Jahren nur unter Aufsicht.',
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
    <div className="container max-w-3xl py-12 lg:py-16">
      <header className="mb-10 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Service</p>
        <h1 className="font-serif text-4xl tracking-tight">Häufig gestellte Fragen</h1>
        <p className="text-muted-foreground">
          Antworten zu Versand, Pflege und Rückgabe. Hast du etwas, das hier nicht steht?{' '}
          <Link href="/kontakt" className="underline-offset-2 hover:underline">
            Schreib uns
          </Link>
          .
        </p>
      </header>

      <ul className="space-y-3">
        {faqs.map((f, i) => (
          <li key={i}>
            <details className="group rounded-2xl border border-border bg-card p-5 open:shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-serif text-lg tracking-tight">
                {f.question}
                <span
                  aria-hidden
                  className="text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{f.answer}</p>
            </details>
          </li>
        ))}
      </ul>

      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <link rel="canonical" href={absoluteUrl('/faq')} />
    </div>
  );
}
