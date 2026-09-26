import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { YarnBall } from '@/components/illustrations/yarn-ball';
import { CORE_CATEGORIES, toneClasses } from '@/lib/category-theme';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="bg-granny flex min-h-dvh flex-col">
      <header className="container py-6">
        <Logo />
      </header>
      <main
        id="inhalt"
        className="container flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center"
      >
        {/* Loser Faden mit Knäuel – pendelt sanft (nur ohne „Bewegung reduzieren“) */}
        <div aria-hidden="true" className="relative h-56 w-40">
          <div className="absolute inset-x-0 top-0 flex justify-center">
            <div className="animate-swing flex flex-col items-center">
              <svg viewBox="0 0 40 150" className="h-36 w-8">
                <path
                  d="M20 0 C 8 30, 32 50, 18 80 S 26 130, 20 150"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <YarnBall wool="himbeere" className="-mt-2 h-20 w-20" />
            </div>
          </div>
        </div>

        <p className="eyebrow">Fehler 404</p>
        <h1 className="max-w-xl text-balance">Da hat sich eine Masche gelöst.</h1>
        <p className="max-w-md text-pretty text-muted-foreground">
          Diese Seite gibt es nicht (mehr). Vielleicht wurde das Stück schon verkauft – oder der
          Link hat einen Knoten. Hier geht&apos;s weiter:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/produkte">
              Zur Kollektion <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
        <nav aria-label="Kategorien" className="mt-4">
          <ul className="flex flex-wrap justify-center gap-2">
            {CORE_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/kategorie/${c.slug}`}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform motion-safe:hover:-translate-y-0.5',
                    toneClasses[c.tone].surface,
                  )}
                >
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full', toneClasses[c.tone].dot)}
                    aria-hidden
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
