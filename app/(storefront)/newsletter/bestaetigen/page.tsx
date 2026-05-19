import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { confirmNewsletterByToken } from '@/actions/newsletter';

export const metadata: Metadata = {
  title: 'Newsletter bestätigen',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Search = { token?: string };

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { token } = await searchParams;

  let icon = <Mail className="h-12 w-12 text-primary" />;
  let title = 'Hmm, da fehlt etwas.';
  let message = 'Diese Bestätigungs-URL ist nicht vollständig.';

  if (token) {
    const result = await confirmNewsletterByToken(token);
    if (result.ok) {
      icon = <CheckCircle2 className="h-12 w-12 text-primary" />;
      title = result.alreadyConfirmed
        ? 'Schon bestätigt – herzlich willkommen!'
        : 'Vielen Dank, du bist dabei!';
      message = 'Wir melden uns nur, wenn es wirklich etwas zu erzählen gibt.';
    } else {
      icon = <XCircle className="h-12 w-12 text-destructive" />;
      title =
        result.reason === 'expired' ? 'Bestätigungs-Link abgelaufen' : 'Bestätigungs-Link ungültig';
      message =
        result.reason === 'expired'
          ? 'Der Link ist nur 48 Stunden gültig. Bitte trage deine E-Mail erneut ein – wir senden dir einen neuen Link.'
          : 'Bitte trage deine E-Mail erneut im Footer ein.';
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
