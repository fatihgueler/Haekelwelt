import type { Metadata } from 'next';
import { Mail, MapPin } from 'lucide-react';

import { ContactForm } from '@/components/storefront/contact-form';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Schreib uns eine Nachricht – wir antworten in der Regel innerhalb 1–2 Werktagen.',
};

export default function KontaktPage() {
  return (
    <div className="container py-12 lg:py-16">
      <header className="mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Service</p>
        <h1 className="font-serif text-4xl tracking-tight">Kontakt</h1>
        <p className="text-muted-foreground">
          Hast du Fragen zu einer Bestellung, einem Produkt oder möchtest du eine Sonderanfertigung
          anfragen? Wir freuen uns über deine Nachricht.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />

        <aside className="space-y-4 rounded-2xl border border-border bg-card p-6 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="font-medium">E-Mail</p>
              <p className="text-muted-foreground">kontakt@haekelwelt.de</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Werkstatt</p>
              <p className="text-muted-foreground">Adresse siehe Impressum</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Wir antworten in der Regel innerhalb von 1–2 Werktagen, Mo–Fr.
          </p>
        </aside>
      </div>
    </div>
  );
}
