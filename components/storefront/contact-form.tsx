'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitContactAction, type ContactActionResult } from '@/actions/contact';

const initial: ContactActionResult = { ok: false, message: '' };

export function ContactForm() {
  const [state, action] = useFormState(submitContactAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6 text-sm">
        <p className="font-medium text-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <Label htmlFor="contact-website">Website (bitte leer lassen)</Label>
        <Input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="contact-name"
          name="name"
          label="Name"
          autoComplete="name"
          required
          error={state.fieldErrors?.name?.[0]}
        />
        <Field
          id="contact-email"
          name="email"
          label="E-Mail"
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email?.[0]}
        />
      </div>

      <Field
        id="contact-subject"
        name="subject"
        label="Betreff"
        required
        error={state.fieldErrors?.subject?.[0]}
      />

      <div className="space-y-2">
        <Label htmlFor="contact-body">Nachricht</Label>
        <textarea
          id="contact-body"
          name="body"
          required
          rows={6}
          minLength={20}
          maxLength={4000}
          className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Wie können wir dir helfen?"
        />
        {state.fieldErrors?.body?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="contact-privacy" name="acceptPrivacy" />
        <Label htmlFor="contact-privacy" className="cursor-pointer text-xs leading-relaxed">
          Ich habe die{' '}
          <a href="/datenschutz" className="underline-offset-2 hover:underline">
            Datenschutzerklärung
          </a>{' '}
          zur Kenntnis genommen.
        </Label>
      </div>
      {state.fieldErrors?.acceptPrivacy?.[0] ? (
        <p className="text-xs text-destructive">{state.fieldErrors.acceptPrivacy[0]}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  required,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Nachricht senden
    </Button>
  );
}
