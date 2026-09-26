'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { subscribeNewsletterAction, type NewsletterActionResult } from '@/actions/newsletter';

const initial: NewsletterActionResult = { ok: false, message: '' };

export function NewsletterForm() {
  const [state, action] = useFormState(subscribeNewsletterAction, initial);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Mail className="h-4 w-4" aria-hidden />
        <h2 className="font-serif text-lg tracking-tight sm:text-lg">Newsletter</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Neue Stücke, kleine Werkstatt-Geschichten und ab und zu ein Rabatt. Kein Spam, Abmeldung mit
        einem Klick.
      </p>

      {state.message ? (
        <div
          role={state.ok ? 'status' : 'alert'}
          className={`mb-4 rounded-xl border p-3 text-sm ${
            state.ok
              ? 'border-success/40 bg-success-soft text-foreground'
              : 'border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <NewsletterFields state={state} action={action} />
    </div>
  );
}

function NewsletterFields({
  state,
  action,
}: {
  state: NewsletterActionResult;
  action: (formData: FormData) => void;
}) {
  const fieldErrors = !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={action} className="space-y-3" noValidate>
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <Label htmlFor="newsletter-website">Website (bitte leer lassen)</Label>
        <Input
          id="newsletter-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          E-Mail
        </Label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="deine@email.de"
          aria-invalid={Boolean(fieldErrors?.email)}
        />
        {fieldErrors?.email?.[0] ? (
          <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="newsletter-privacy" name="acceptPrivacy" />
        <Label htmlFor="newsletter-privacy" className="cursor-pointer text-xs leading-relaxed">
          Ich willige in den Versand des Newsletters ein und habe die{' '}
          <a href="/datenschutz" className="underline-offset-2 hover:underline">
            Datenschutzerklärung
          </a>{' '}
          zur Kenntnis genommen.
        </Label>
      </div>
      {fieldErrors?.acceptPrivacy?.[0] ? (
        <p className="text-xs text-destructive">{fieldErrors.acceptPrivacy[0]}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="sm">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Anmelden
    </Button>
  );
}
