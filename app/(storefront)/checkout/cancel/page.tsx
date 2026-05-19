import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Bestellung abgebrochen',
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="font-serif text-4xl tracking-tight">Bestellung abgebrochen</h1>
        <p className="text-muted-foreground">
          Kein Problem – dein Warenkorb ist gespeichert. Du kannst die Bestellung jederzeit
          fortsetzen.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/warenkorb">Zum Warenkorb</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/produkte">Weiter stöbern</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
