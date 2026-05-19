import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Versand & Lieferung',
  description: 'Versandkosten, Lieferzeiten und Verpackung bei Häkelwelt.',
};

export default function VersandPage() {
  return (
    <div className="container max-w-3xl py-12 lg:py-16">
      <header className="mb-10 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Service</p>
        <h1 className="font-serif text-4xl tracking-tight">Versand & Lieferung</h1>
      </header>

      <div className="space-y-6 text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Versandkosten</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              Deutschland: <strong>4,90 €</strong> pauschal, ab <strong>50 €</strong> Bestellwert
              versandkostenfrei.
            </li>
            <li>
              Andere EU-Länder: <strong>9,90 €</strong> pauschal, ab <strong>80 €</strong>{' '}
              Bestellwert versandkostenfrei.
            </li>
            <li>Außerhalb der EU: aktuell kein Versand.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl tracking-tight">Lieferzeiten</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Deutschland: 2–4 Werktage nach Zahlungseingang.</li>
            <li>EU-Länder: 4–8 Werktage nach Zahlungseingang.</li>
            <li>Wir versenden in der Regel am nächsten Werktag.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl tracking-tight">Verpackung</h2>
          <p className="mt-3">
            Wir verpacken plastikfrei: Karton, Pergaminpapier und – wenn nötig – kompostierbares
            Füllmaterial. Eine kleine handgeschriebene Karte liegt jeder Bestellung bei.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl tracking-tight">Versanddienstleister</h2>
          <p className="mt-3">
            Wir versenden mit DHL als versichertes Paket. Du erhältst eine
            Sendungsverfolgungs-Nummer per E-Mail, sobald dein Paket auf dem Weg ist.
          </p>
        </section>
      </div>
    </div>
  );
}
