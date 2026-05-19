import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Registrieren',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="space-y-8 rounded-3xl border border-border bg-card p-8 shadow-soft">
      <header className="space-y-1 text-center">
        <h1 className="font-serif text-3xl tracking-tight">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Schneller einkaufen, Bestellungen verfolgen, Wunschliste speichern.
        </p>
      </header>
      <RegisterForm />
    </div>
  );
}
