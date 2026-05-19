'use client';

import * as React from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerAction, type AuthState } from '@/actions/auth';

const initial: AuthState = { ok: false };

export function RegisterForm() {
  const [state, action] = useFormState(registerAction, initial);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.ok
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <Field
        id="name"
        name="name"
        label="Name"
        autoComplete="name"
        required
        error={state.fieldErrors?.name?.[0]}
      />
      <Field
        id="email"
        name="email"
        label="E-Mail"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        id="password"
        name="password"
        label="Passwort (mind. 12 Zeichen, inkl. Klein-/Großbuchstabe & Ziffer)"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password?.[0]}
      />
      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Checkbox
          id="acceptTerms"
          name="acceptTerms"
          aria-invalid={Boolean(state.fieldErrors?.acceptTerms?.[0])}
        />
        <Label htmlFor="acceptTerms" className="cursor-pointer text-sm leading-relaxed">
          Ich akzeptiere die{' '}
          <Link href="/agb" className="underline-offset-2 hover:underline">
            AGB
          </Link>{' '}
          und die{' '}
          <Link href="/datenschutz" className="underline-offset-2 hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </Label>
      </div>
      {state.fieldErrors?.acceptTerms?.[0] ? (
        <p className="text-xs text-destructive">{state.fieldErrors.acceptTerms[0]}</p>
      ) : null}
      <SubmitButton label="Konto erstellen" />
      <p className="text-center text-sm text-muted-foreground">
        Schon registriert?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Jetzt einloggen
        </Link>
      </p>
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
