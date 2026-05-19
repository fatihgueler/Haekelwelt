import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/db';
import { formatPriceCents } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Bestellung bestätigt',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Search = { orderId?: string };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) notFound();

  const isPaid =
    order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED';

  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        {isPaid ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-serif text-4xl tracking-tight">Danke für deine Bestellung!</h1>
            <p className="text-muted-foreground">
              Wir haben deine Zahlung erhalten und beginnen mit der Vorbereitung. Eine
              Bestätigungs-Mail ist unterwegs an <strong>{order.email}</strong>. Bitte prüfe auch
              deinen Spam-Ordner, falls sie nicht innerhalb weniger Minuten ankommt.
            </p>
          </>
        ) : (
          <>
            <Clock className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-serif text-4xl tracking-tight">Bestellung wird verarbeitet</h1>
            <p className="text-muted-foreground">
              Wir warten auf die Zahlungsbestätigung von Stripe. Das dauert in der Regel nur wenige
              Sekunden. Diese Seite aktualisiert sich, sobald die Bestätigung da ist.
            </p>
            <meta httpEquiv="refresh" content="6" />
          </>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 text-left">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl tracking-tight">Bestellnummer</h2>
            <p className="font-mono text-sm">{order.number}</p>
          </div>
          <Separator className="my-4" />
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity} × {item.titleSnapshot}
                </span>
                <span>{formatPriceCents(item.lineSubtotalCents)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Zwischensumme</dt>
              <dd>{formatPriceCents(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Versand</dt>
              <dd>
                {order.shippingCents === 0 ? 'Gratis' : formatPriceCents(order.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>davon MwSt.</dt>
              <dd>{formatPriceCents(order.taxCents)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Gesamt</dt>
              <dd>{formatPriceCents(order.totalCents)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/produkte">Weiter stöbern</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
