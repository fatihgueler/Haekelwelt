import { YarnBall, type Wool } from '@/components/illustrations/yarn-ball';
import { PicotDivider } from '@/components/illustrations/motifs';
import { cn } from '@/lib/utils';

const surfaces = {
  brand: { bg: 'bg-primary-soft', text: 'text-primary-soft', ink: 'text-primary' },
  heimdeko: {
    bg: 'bg-cat-heimdeko-surface',
    text: 'text-cat-heimdeko-surface',
    ink: 'text-cat-heimdeko-ink',
  },
  kinder: {
    bg: 'bg-cat-kinder-surface',
    text: 'text-cat-kinder-surface',
    ink: 'text-cat-kinder-ink',
  },
  accessoires: {
    bg: 'bg-cat-accessoires-surface',
    text: 'text-cat-accessoires-surface',
    ink: 'text-cat-accessoires-ink',
  },
  amigurumi: {
    bg: 'bg-cat-amigurumi-surface',
    text: 'text-cat-amigurumi-surface',
    ink: 'text-cat-amigurumi-ink',
  },
  mint: { bg: 'bg-success-soft', text: 'text-success-soft', ink: 'text-success' },
} as const;

/**
 * Kopfbereich für Inhaltsseiten: farbige Fläche mit Granny-Textur, Eyebrow,
 * H1, Intro, dekorativem Wollknäuel und Picot-Kante.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  tone = 'brand',
  wool = 'himbeere',
  className,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  tone?: keyof typeof surfaces;
  wool?: Wool;
  className?: string;
}) {
  const s = surfaces[tone];
  return (
    <>
      <section className={cn('relative overflow-hidden', s.bg, className)}>
        <div aria-hidden="true" className="bg-granny absolute inset-0 opacity-70" />
        <div className="container relative flex items-center justify-between gap-6 py-10 lg:py-14">
          <div className="max-w-2xl">
            <p className={cn('eyebrow', s.ink)}>{eyebrow}</p>
            <h1 className="mt-2 text-balance">{title}</h1>
            {children ? (
              <div className="mt-3 text-pretty text-lg text-foreground/80">{children}</div>
            ) : null}
          </div>
          <YarnBall
            wool={wool}
            tail
            className="hidden h-28 w-32 shrink-0 motion-safe:animate-bob-slow sm:block lg:h-36 lg:w-44"
          />
        </div>
      </section>
      <PicotDivider flip className={cn('-mt-px', s.text)} />
    </>
  );
}
