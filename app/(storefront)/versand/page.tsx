import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Leaf, MapPin, Truck } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { reveal } from '@/lib/reveal';

export const metadata: Metadata = {
  title: 'Versand & Lieferung',
  description: 'Versandkosten, Lieferzeiten und Verpackung bei Häkelwelt.',
};

const rates = [
  { region: 'Deutschland', cost: '4,90 €', free: 'ab 50 € gratis', time: '2–4 Werktage' },
  { region: 'Andere EU-Länder', cost: '9,90 €', free: 'ab 80 € gratis', time: '4–8 Werktage' },
  { region: 'Außerhalb der EU', cost: '–', free: 'aktuell kein Versand', time: '–' },
] as const;

export default function VersandPage() {
  return (
    <div className="pb-16">
      <PageHeader eyebrow="Service" title="Versand & Lieferung" tone="heimdeko" wool="senf">
        Wir verschicken in der Regel am nächsten Werktag – plastikfrei verpackt und mit einer
        kleinen Karte.
      </PageHeader>

      <div className="container max-w-4xl space-y-10 pt-10">
        <section aria-labelledby="kosten-heading" {...reveal(0)}>
          <h2 id="kosten-heading" className="font-serif text-2xl sm:text-3xl">
            Versandkosten &amp; Lieferzeiten
          </h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Versandkosten und Lieferzeiten nach Region</caption>
              <thead className="bg-secondary text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                    Region
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                    Kosten
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">
                    Gratisversand
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                    Lieferzeit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rates.map((r) => (
                  <tr key={r.region}>
                    <th scope="row" className="px-4 py-4 font-semibold sm:px-6">
                      {r.region}
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:hidden">
                        {r.free}
                      </span>
                    </th>
                    <td className="px-4 py-4 tabular-nums sm:px-6">{r.cost}</td>
                    <td className="hidden px-4 py-4 text-success sm:table-cell sm:px-6">
                      {r.free}
                    </td>
                    <td className="px-4 py-4 sm:px-6">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Lieferzeiten gelten ab Zahlungseingang.
          </p>
        </section>

        <ul className="grid gap-5 sm:grid-cols-3">
          <li className="rounded-3xl bg-success-soft p-6" {...reveal(1)}>
            <Leaf className="h-6 w-6 text-success" aria-hidden />
            <h2 className="mt-3 font-serif text-xl sm:text-xl">Verpackung</h2>
            <p className="mt-2 text-sm text-foreground/80">
              Plastikfrei: Karton, Pergaminpapier und – wenn nötig – kompostierbares Füllmaterial.
              Eine handgeschriebene Karte liegt jeder Bestellung bei.
            </p>
          </li>
          <li className="rounded-3xl bg-cat-kinder-surface p-6" {...reveal(2)}>
            <Truck className="h-6 w-6 text-cat-kinder-ink" aria-hidden />
            <h2 className="mt-3 font-serif text-xl sm:text-xl">Versanddienstleister</h2>
            <p className="mt-2 text-sm text-foreground/80">
              Wir versenden mit DHL als versichertes Paket. Die Sendungsnummer bekommst du per
              E-Mail, sobald dein Paket unterwegs ist.
            </p>
          </li>
          <li className="rounded-3xl bg-primary-soft p-6" {...reveal(3)}>
            <Clock className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-3 font-serif text-xl sm:text-xl">Schnell unterwegs</h2>
            <p className="mt-2 text-sm text-foreground/80">
              In der Regel verlässt dein Paket unsere Werkstatt am nächsten Werktag nach
              Zahlungseingang.
            </p>
          </li>
        </ul>

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Fragen zu deiner Lieferung? Schau in die{' '}
            <Link href="/faq" className="font-medium text-primary underline underline-offset-4">
              FAQ
            </Link>{' '}
            oder{' '}
            <Link href="/kontakt" className="font-medium text-primary underline underline-offset-4">
              schreib uns
            </Link>
            .
          </span>
        </p>
      </div>
    </div>
  );
}
