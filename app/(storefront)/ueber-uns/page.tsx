import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Leaf, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GrannySquare, ThreadLine } from '@/components/illustrations/motifs';
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { PageHeader } from '@/components/shared/page-header';
import { reveal } from '@/lib/reveal';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Über uns',
  description:
    'Wer wir sind, wie wir arbeiten und warum jedes Stück bei Häkelwelt mit Liebe von Hand entsteht.',
};

const pillars = [
  {
    icon: Heart,
    title: 'Handarbeit',
    text: 'Jede Masche entsteht in unserer Werkstatt – keine Maschine ersetzt das. Darum ist jedes Stück ein bisschen anders.',
    surface: 'bg-primary-soft',
    ink: 'text-primary',
  },
  {
    icon: Leaf,
    title: 'Materialien',
    text: 'OEKO-TEX-zertifizierte Wolle, überwiegend aus Europa, und Bio-Baumwolle, wo immer es sie gibt.',
    surface: 'bg-success-soft',
    ink: 'text-success',
  },
  {
    icon: Package,
    title: 'Verpackung',
    text: 'Plastikfrei mit Karton und Pergamin – und mit einer handgeschriebenen Karte obendrauf.',
    surface: 'bg-cat-heimdeko-surface',
    ink: 'text-cat-heimdeko-ink',
  },
] as const;

const facts = [
  { value: 'ca. 6 Std.', label: 'für einen Kuschelhasen' },
  { value: '100 %', label: 'von Hand gehäkelt' },
  { value: '0 g', label: 'Plastik in der Verpackung' },
] as const;

export default function UeberUnsPage() {
  return (
    <div className="pb-16">
      <PageHeader eyebrow="Über uns" title="Kleine Werkstatt, große Liebe zum Detail.">
        Häkelwelt ist die Werkstatt, in der jedes Stück von Hand entsteht – Masche für Masche, ohne
        Hektik und ohne Serienfertigung.
      </PageHeader>

      <section
        aria-labelledby="geschichte-heading"
        className="container grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16"
      >
        <div className="space-y-5 text-base leading-relaxed text-foreground/90" {...reveal(0)}>
          <h2 id="geschichte-heading">Warum wir häkeln</h2>
          <p>
            Wir glauben, dass schöne Dinge Zeit brauchen. Eine kleine Kuschelfigur dauert oft
            mehrere Stunden – eine Decke kann uns viele Tage begleiten. Was dabei entsteht, soll
            länger halten als ein Trend.
          </p>
          <p>
            Unsere Wolle stammt überwiegend aus Europa und ist nach OEKO-TEX zertifiziert. Wo immer
            es geht, verwenden wir Naturfasern. Verpackt wird ohne Plastik – mit Karton, Pergamin
            und einer handgeschriebenen Karte.
          </p>
          <p>
            Wenn du Fragen hast, schreib uns gern an{' '}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-primary underline underline-offset-4"
            >
              {SITE.email}
            </a>
            . Wir antworten in der Regel innerhalb von {SITE.responseTime}.
          </p>
        </div>
        <div className="relative" {...reveal(1)}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cat-kinder-surface shadow-soft">
            <div aria-hidden="true" className="bg-granny absolute inset-0 opacity-80" />
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center gap-3"
            >
              <YarnBall wool="senf" className="h-20 w-20 motion-safe:animate-bob" />
              <YarnBall wool="himbeere" className="h-28 w-28" tail />
              <YarnBall wool="mint" className="h-16 w-16 motion-safe:animate-bob-slow" />
            </div>
            <p className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground">
              Foto folgt: {SITE.workshopPhoto}
            </p>
          </div>
          <GrannySquare className="absolute -right-2 -top-4 h-14 w-14 rotate-12 sm:-right-4 sm:h-16 sm:w-16" />
        </div>
      </section>

      <section aria-label="Werkstatt in Zahlen" className="bg-secondary py-10">
        <dl className="container grid gap-6 text-center sm:grid-cols-3">
          {facts.map((f, i) => (
            <div key={f.label} {...reveal(i)}>
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="block font-serif text-4xl font-semibold text-primary">
                  {f.value}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="werte-heading" className="container relative py-12 lg:py-16">
        <ThreadLine className="absolute inset-x-0 top-4 text-cat-accessoires-deco opacity-60" />
        <h2 id="werte-heading" className="relative text-center">
          Worauf wir Wert legen
        </h2>
        <ul className="relative mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text, surface, ink }, i) => (
            <li key={title} className={`rounded-3xl p-6 ${surface}`} {...reveal(i)}>
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-card ${ink}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-serif text-xl sm:text-xl">{title}</h3>
              <p className="mt-2 text-sm text-foreground/80">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/produkte">Kollektion entdecken</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/kontakt">Schreib uns</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
