import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { ContactForm } from '@/components/storefront/contact-form';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Schreib uns eine Nachricht – wir antworten in der Regel innerhalb von 1–2 Werktagen.',
};

export default function KontaktPage() {
  return (
    <div className="pb-16">
      <PageHeader eyebrow="Service" title="Schreib uns!" tone="mint" wool="mint">
        Fragen zu einer Bestellung, einem Stück oder ein Wunsch nach einer Sonderanfertigung? Wir
        freuen uns über deine Nachricht.
      </PageHeader>

      <div className="container grid gap-10 pt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <section
          aria-labelledby="formular-heading"
          className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <h2 id="formular-heading" className="font-serif text-2xl sm:text-2xl">
            Deine Nachricht
          </h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Alle Felder sind Pflichtfelder.</p>
          <ContactForm />
        </section>

        <aside aria-label="Kontaktinformationen" className="space-y-4">
          <ul className="space-y-4 rounded-3xl bg-secondary p-6 text-sm">
            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                <Mail className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">E-Mail</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-primary underline underline-offset-4"
                >
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                <Clock className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Antwortzeit</p>
                <p className="text-muted-foreground">
                  In der Regel innerhalb von {SITE.responseTime}, Mo–Fr.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Werkstatt</p>
                <p className="text-muted-foreground">
                  {SITE.workshopCity} –{' '}
                  <Link
                    href="/impressum"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Adresse im Impressum
                  </Link>
                </p>
              </div>
            </li>
          </ul>
          <div className="flex items-start gap-3 rounded-3xl bg-accent p-6 text-sm text-accent-foreground">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              <strong className="font-semibold">Sonderwunsch?</strong> Andere Farbe, ein Name auf
              der Decke oder ein Geschenk zur Geburt – beschreib uns einfach, was du dir vorstellst.
            </p>
          </div>
          <p className="px-2 text-sm text-muted-foreground">
            Schnelle Antworten findest du auch in den{' '}
            <Link href="/faq" className="font-medium text-primary underline underline-offset-4">
              häufigen Fragen
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
