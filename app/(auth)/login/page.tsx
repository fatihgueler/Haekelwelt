import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Anmelden',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-soft-lg sm:p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl sm:text-4xl">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground">
          Melde dich an, um deinen Warenkorb und deine Bestellungen zu verwalten.
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
