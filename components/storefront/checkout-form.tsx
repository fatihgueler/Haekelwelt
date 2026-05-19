'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EU_COUNTRIES } from '@/lib/pricing';
import { createCheckoutSessionAction } from '@/actions/checkout';
import type { CheckoutInput, AddressInput } from '@/lib/validators/address';

const countryLabels: Record<string, string> = {
  DE: 'Deutschland',
  AT: 'Österreich',
  BE: 'Belgien',
  BG: 'Bulgarien',
  CY: 'Zypern',
  CZ: 'Tschechien',
  DK: 'Dänemark',
  EE: 'Estland',
  ES: 'Spanien',
  FI: 'Finnland',
  FR: 'Frankreich',
  GR: 'Griechenland',
  HR: 'Kroatien',
  HU: 'Ungarn',
  IE: 'Irland',
  IT: 'Italien',
  LT: 'Litauen',
  LU: 'Luxemburg',
  LV: 'Lettland',
  MT: 'Malta',
  NL: 'Niederlande',
  PL: 'Polen',
  PT: 'Portugal',
  RO: 'Rumänien',
  SE: 'Schweden',
  SI: 'Slowenien',
  SK: 'Slowakei',
};

const sortedCountries = Array.from(EU_COUNTRIES).sort((a, b) =>
  (countryLabels[a] ?? a).localeCompare(countryLabels[b] ?? b, 'de'),
);

const emptyAddress: AddressInput = {
  firstName: '',
  lastName: '',
  company: '',
  line1: '',
  line2: '',
  postalCode: '',
  city: '',
  country: 'DE',
  phone: '',
};

export function CheckoutForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [pending, startTransition] = React.useTransition();
  const [email, setEmail] = React.useState(defaultEmail);
  const [shipping, setShipping] = React.useState<AddressInput>(emptyAddress);
  const [billingSame, setBillingSame] = React.useState(true);
  const [billing, setBilling] = React.useState<AddressInput>(emptyAddress);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const submit: React.FormEventHandler = (e) => {
    e.preventDefault();
    setFieldErrors({});

    const payload: CheckoutInput = {
      email,
      shipping,
      billingSameAsShipping: billingSame,
      billing: billingSame ? undefined : billing,
      acceptTerms: acceptTerms as true,
    };

    startTransition(async () => {
      const res = await createCheckoutSessionAction(payload);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        toast.error(res.message);
        return;
      }
      window.location.href = res.url;
    });
  };

  const err = (key: string) => fieldErrors[key]?.[0];

  return (
    <form className="space-y-8" onSubmit={submit} noValidate>
      <fieldset className="space-y-4">
        <legend className="font-serif text-xl tracking-tight">Kontakt</legend>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail für Bestellbestätigung</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(err('email'))}
          />
          {err('email') ? <FormError msg={err('email')} /> : null}
        </div>
      </fieldset>

      <AddressFieldset
        legend="Lieferadresse"
        prefix="shipping"
        value={shipping}
        onChange={setShipping}
        errors={fieldErrors}
      />

      <fieldset className="space-y-4">
        <legend className="sr-only">Rechnungsadresse</legend>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
          <Checkbox
            id="billingSame"
            checked={billingSame}
            onCheckedChange={(v) => setBillingSame(v === true)}
          />
          <Label htmlFor="billingSame" className="cursor-pointer leading-relaxed">
            Rechnungsadresse entspricht der Lieferadresse
          </Label>
        </div>
        {!billingSame ? (
          <AddressFieldset
            legend="Rechnungsadresse"
            prefix="billing"
            value={billing}
            onChange={setBilling}
            errors={fieldErrors}
          />
        ) : null}
      </fieldset>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            aria-invalid={Boolean(err('acceptTerms'))}
          />
          <Label htmlFor="acceptTerms" className="cursor-pointer text-sm leading-relaxed">
            Ich habe die{' '}
            <a href="/agb" className="underline-offset-2 hover:underline" target="_blank">
              AGB
            </a>{' '}
            und die{' '}
            <a href="/widerruf" className="underline-offset-2 hover:underline" target="_blank">
              Widerrufsbelehrung
            </a>{' '}
            gelesen und akzeptiert. Die{' '}
            <a href="/datenschutz" className="underline-offset-2 hover:underline" target="_blank">
              Datenschutzerklärung
            </a>{' '}
            habe ich zur Kenntnis genommen.
          </Label>
        </div>
        {err('acceptTerms') ? <FormError msg={err('acceptTerms')} /> : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Kostenpflichtig bestellen
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Du wirst zur sicheren Zahlung bei Stripe weitergeleitet. Akzeptiert werden Kreditkarte sowie
        alle von Stripe in deinem Land angebotenen Methoden.
      </p>
    </form>
  );
}

function AddressFieldset({
  legend,
  prefix,
  value,
  onChange,
  errors,
}: {
  legend: string;
  prefix: 'shipping' | 'billing';
  value: AddressInput;
  onChange: (v: AddressInput) => void;
  errors: Record<string, string[]>;
}) {
  const set = <K extends keyof AddressInput>(key: K, val: AddressInput[K]) =>
    onChange({ ...value, [key]: val });

  const err = (key: keyof AddressInput) => errors[`${prefix}.${key as string}`]?.[0];

  return (
    <fieldset className="space-y-4">
      <legend className="font-serif text-xl tracking-tight">{legend}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" id={`${prefix}-firstName`} error={err('firstName')}>
          <Input
            id={`${prefix}-firstName`}
            autoComplete="given-name"
            required
            value={value.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>
        <Field label="Nachname" id={`${prefix}-lastName`} error={err('lastName')}>
          <Input
            id={`${prefix}-lastName`}
            autoComplete="family-name"
            required
            value={value.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Firma (optional)" id={`${prefix}-company`} error={err('company')}>
        <Input
          id={`${prefix}-company`}
          autoComplete="organization"
          value={value.company ?? ''}
          onChange={(e) => set('company', e.target.value)}
        />
      </Field>
      <Field label="Straße und Hausnummer" id={`${prefix}-line1`} error={err('line1')}>
        <Input
          id={`${prefix}-line1`}
          autoComplete="address-line1"
          required
          value={value.line1}
          onChange={(e) => set('line1', e.target.value)}
        />
      </Field>
      <Field label="Adresszusatz (optional)" id={`${prefix}-line2`} error={err('line2')}>
        <Input
          id={`${prefix}-line2`}
          autoComplete="address-line2"
          value={value.line2 ?? ''}
          onChange={(e) => set('line2', e.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <Field label="PLZ" id={`${prefix}-postalCode`} error={err('postalCode')}>
          <Input
            id={`${prefix}-postalCode`}
            autoComplete="postal-code"
            required
            value={value.postalCode}
            onChange={(e) => set('postalCode', e.target.value)}
          />
        </Field>
        <Field label="Stadt" id={`${prefix}-city`} error={err('city')}>
          <Input
            id={`${prefix}-city`}
            autoComplete="address-level2"
            required
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Land" id={`${prefix}-country`} error={err('country')}>
        <Select value={value.country} onValueChange={(v) => set('country', v)}>
          <SelectTrigger id={`${prefix}-country`}>
            <SelectValue placeholder="Land wählen" />
          </SelectTrigger>
          <SelectContent>
            {sortedCountries.map((cc) => (
              <SelectItem key={cc} value={cc}>
                {countryLabels[cc] ?? cc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Telefon (optional, für Rückfragen)" id={`${prefix}-phone`} error={err('phone')}>
        <Input
          id={`${prefix}-phone`}
          type="tel"
          autoComplete="tel"
          value={value.phone ?? ''}
          onChange={(e) => set('phone', e.target.value)}
        />
      </Field>
    </fieldset>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <FormError msg={error} /> : null}
    </div>
  );
}

function FormError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}
