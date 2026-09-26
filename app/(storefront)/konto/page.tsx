import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { formatDateDE, formatPriceCents } from '@/lib/utils';
import { signOutAction } from '@/actions/auth';

export const metadata: Metadata = {
  title: 'Mein Konto',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [orders, addressCount] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.address.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Mein Konto</p>
          <h1 className="font-serif text-4xl tracking-tight">
            Hallo {session.user.name ?? session.user.email}
          </h1>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" type="submit">
            Abmelden
          </Button>
        </form>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bestellungen</CardTitle>
            <CardDescription>Deine letzten Bestellungen im Überblick.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Bestellungen.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-mono">{o.number}</span>
                      <span className="ml-2 text-muted-foreground">
                        {formatDateDE(o.createdAt)}
                      </span>
                    </span>
                    <span className="font-medium">{formatPriceCents(o.totalCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adressen</CardTitle>
            <CardDescription>Versand- und Rechnungsadressen verwalten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {addressCount > 0
                ? `${addressCount} gespeicherte Adresse(n).`
                : 'Noch keine Adressen gespeichert.'}
            </p>
            <p className="text-muted-foreground">
              Neue Adressen gibst du einfach beim nächsten Checkout ein.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konto</CardTitle>
            <CardDescription>E-Mail und Passwort.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {session.user.email}
              <br />
              {session.user.role === 'ADMIN' ? 'Administrator-Zugang' : 'Kunden-Konto'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
