import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { unsubscribeNewsletterByToken } from '@/actions/newsletter';

export const metadata: Metadata = {
  title: 'Newsletter abmelden',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Search = { token?: string };

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { token } = await searchParams;

  let icon = <XCircle className="h-12 w-12 text-destructive" />;
  let title = 'Abmelden nicht möglich';
  let message = 'Bitte nutze den Abmelde-Link aus einer unserer E-Mails.';

  if (token) {
    const result = await unsubscribeNewsletterByToken(token);
    if (result.ok) {
      icon = <CheckCircle2 className="h-12 w-12 text-primary" />;
      title = 'Du bist abgemeldet.';
      message = 'Wir senden dir keine Newsletter mehr. Schade – aber wir verstehen das.';
    }
  }

  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-xl space-y-5 text-center">
        <div className="mx-auto">{icon}</div>
        <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href="/produkte">Zur Kollektion</Link>
        </Button>
      </div>
    </div>
  );
}
