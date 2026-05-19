'use client';

import * as React from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Consent = {
  necessary: true; // immer wahr, kann nicht abgewählt werden
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

const STORAGE_KEY = 'hw_consent_v1';

export function CookieBanner() {
  const [decision, setDecision] = React.useState<Consent | null | undefined>(undefined);
  const [details, setDetails] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setDecision(raw ? (JSON.parse(raw) as Consent) : null);
    } catch {
      setDecision(null);
    }
  }, []);

  const save = (consent: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setDecision(consent);
    // Tracking-Scripts erst nach Consent dynamisch laden würden hier triggern.
  };

  const acceptOnlyNecessary = () =>
    save({
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
  const acceptAll = () =>
    save({
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
  const saveSelection = () =>
    save({ necessary: true, analytics, marketing, decidedAt: new Date().toISOString() });

  if (decision === undefined || decision !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-up border-t border-border bg-card text-card-foreground shadow-soft-lg"
    >
      <div className="container py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex items-start gap-3">
            <Cookie className="mt-1 h-5 w-5 text-primary" aria-hidden />
            <div className="space-y-1">
              <h2 id="cookie-banner-title" className="font-serif text-lg">
                Wir respektieren deine Privatsphäre
              </h2>
              <p className="text-sm text-muted-foreground">
                Wir nutzen ausschließlich technisch notwendige Cookies, um den Shop zu betreiben.
                Analyse- und Marketing-Cookies werden nur mit deiner Einwilligung geladen. Mehr in
                der{' '}
                <Link
                  href="/datenschutz"
                  className="underline underline-offset-2 hover:text-primary"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setDetails((v) => !v)}>
              {details ? 'Details ausblenden' : 'Auswahl anpassen'}
            </Button>
            <Button variant="outline" size="sm" onClick={acceptOnlyNecessary}>
              Nur notwendige
            </Button>
            <Button size="sm" onClick={acceptAll}>
              Alle akzeptieren
            </Button>
          </div>
        </div>

        {details ? (
          <>
            <Separator className="my-4" />
            <div className="grid gap-3 sm:grid-cols-3">
              <ConsentItem
                title="Notwendig"
                description="Warenkorb, Login, Sicherheit. Ohne diese funktioniert der Shop nicht."
                disabled
                checked
              />
              <ConsentItem
                title="Analyse"
                description="Anonymisierte Nutzungsstatistiken, um den Shop zu verbessern."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentItem
                title="Marketing"
                description="Personalisierte Werbung auf anderen Plattformen."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={saveSelection}>
                Auswahl speichern
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ConsentItem({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = `consent-${title.toLowerCase()}`;
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background p-4">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(v === true)}
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="cursor-pointer">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
