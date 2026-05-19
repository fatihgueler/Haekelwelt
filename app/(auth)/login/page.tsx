import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Anmelden',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="space-y-8 rounded-3xl border border-border bg-card p-8 shadow-soft">
      <header className="space-y-1 text-center">
        <h1 className="font-serif text-3xl tracking-tight">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground">
          Melde dich an, um deinen Warenkorb und deine Bestellungen zu verwalten.
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
