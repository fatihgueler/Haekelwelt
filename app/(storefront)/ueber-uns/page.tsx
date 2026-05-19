import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Leaf, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Über uns',
  description:
    'Wer wir sind, wie wir arbeiten und warum jedes Stück bei Häkelwelt mit Liebe von Hand entsteht.',
};

export default function UeberUnsPage() {
  return (
    <div className="container max-w-3xl py-12 lg:py-16">
      <header className="mb-10 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Über uns</p>
        <h1 className="font-serif text-4xl tracking-tight">
          Kleine Manufaktur, große Liebe zum Detail.
        </h1>
        <p className="text-lg text-muted-foreground">
          Häkelwelt ist die Werkstatt, in der jedes Stück mit der Hand entsteht – Masche für Masche,
          ohne Hektik, ohne Serienfertigung.
        </p>
      </header>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Wir glauben, dass schöne Dinge Zeit brauchen. Eine kleine Kuschelfigur dauert oft mehrere
          Stunden – eine Decke kann uns viele Tage begleiten. Was dabei entsteht, soll länger halten
          als ein Trend.
        </p>
        <p>
          Unsere Wolle stammt überwiegend aus Europa und ist nach OEKO-TEX zertifiziert. Wo immer es
          geht, verwenden wir Naturfasern. Verpackt wird ohne Plastik – mit Karton, Pergamin und
          einer handgeschriebenen Karte.
        </p>
        <p>
          Wenn du Fragen hast, schreib uns gern an{' '}
          <Link href="/kontakt" className="underline-offset-2 hover:underline">
            kontakt@haekelwelt.de
          </Link>
          . Wir antworten in der Regel innerhalb von 1–2 Werktagen.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <Pillar
          icon={<Heart className="h-5 w-5" />}
          title="Handarbeit"
          text="Jede Masche entsteht in unserer Werkstatt – keine Maschine ersetzt das."
        />
        <Pillar
          icon={<Leaf className="h-5 w-5" />}
          title="Materialien"
          text="OEKO-TEX-Wolle, Bio-Baumwolle, soweit verfügbar."
        />
        <Pillar
          icon={<Sparkles className="h-5 w-5" />}
          title="Versand"
          text="Plastikfrei, klimaneutral mit DHL, mit kleiner Karte verpackt."
        />
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/produkte">Zur Kollektion</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kontakt">Kontakt aufnehmen</Link>
        </Button>
      </div>
    </div>
  );
}

function Pillar({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </div>
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
