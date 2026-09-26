import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Registrieren',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-soft-lg sm:p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl sm:text-4xl">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Schneller einkaufen, Bestellungen verfolgen, Wunschliste speichern.
        </p>
      </header>
      <RegisterForm />
    </div>
  );
}
