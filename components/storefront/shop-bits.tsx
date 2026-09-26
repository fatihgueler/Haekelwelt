import { Leaf, Lock, PackageCheck, RotateCcw, Truck } from 'lucide-react';

import { YarnBall, type Wool } from '@/components/illustrations/yarn-ball';
import { SHIPPING_DE_FREE_FROM_CENTS } from '@/lib/pricing';
import { cn, formatPriceCents } from '@/lib/utils';

/**
 * Fortschritt bis zum Gratisversand. Der Balken ist rein dekorativ (scaleX,
 * kein Layout-Shift), die Information steckt im Text.
 */
export function FreeShippingMeter({
  subtotalCents,
  freeFromCents = SHIPPING_DE_FREE_FROM_CENTS,
  className,
}: {
  subtotalCents: number;
  freeFromCents?: number;
  className?: string;
}) {
  const missing = Math.max(0, freeFromCents - subtotalCents);
  const progress = Math.min(1, subtotalCents / freeFromCents);
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm text-foreground">
        {missing > 0 ? (
          <>
            Noch <strong className="font-semibold">{formatPriceCents(missing)}</strong> bis zum
            Gratisversand in Deutschland.
          </>
        ) : (
          <>
            <strong className="font-semibold text-success">Juhu, der Versand ist gratis!</strong>{' '}
            Freu dich auf dein Paket.
          </>
        )}
      </p>
      <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-success-soft">
        <div
          className="h-full origin-left rounded-full bg-success transition-transform duration-700 ease-soft"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

/** Freundlicher Leerzustand mit Wollknäueln */
export function EmptyState({
  title,
  children,
  action,
  headingLevel = 'h2',
  wools = ['himbeere', 'senf', 'mint'],
  className,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
  wools?: [Wool, Wool, Wool];
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card px-6 py-12 text-center sm:px-10',
        className,
      )}
    >
      <div aria-hidden="true" className="mx-auto mb-6 flex h-20 items-end justify-center gap-1">
        <YarnBall wool={wools[0]} className="h-12 w-12 motion-safe:animate-bob" />
        <YarnBall wool={wools[1]} className="h-20 w-20" tail />
        <YarnBall wool={wools[2]} className="h-10 w-10 motion-safe:animate-bob-slow" />
      </div>
      <Heading className="font-serif text-2xl sm:text-2xl">{title}</Heading>
      {children ? (
        <div className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">{children}</div>
      ) : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

const TRUST_ITEMS = [
  { icon: Truck, title: 'Gratisversand ab 50 €', text: 'in Deutschland, sonst 4,90 €' },
  { icon: RotateCcw, title: '14 Tage Widerruf', text: 'ohne Wenn und Aber' },
  { icon: Leaf, title: 'Plastikfrei verpackt', text: 'mit handgeschriebener Karte' },
  { icon: Lock, title: 'Sicher bezahlen', text: 'verschlüsselt über Stripe' },
] as const;

/** Vertrauenselemente (PDP, Warenkorb) */
export function TrustList({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <ul className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-2', className)}>
      {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm leading-snug">
            <span className="block font-semibold text-foreground">{title}</span>
            <span className="text-muted-foreground">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Unikat-Hinweis für die Produktseite */
export function UniqueNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground',
        className,
      )}
    >
      <PackageCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p>
        <strong className="font-semibold">Jedes Stück ist ein Unikat.</strong> Kleine Abweichungen
        in Farbe und Form sind Handarbeit – kein Fehler.
      </p>
    </div>
  );
}
