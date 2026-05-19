import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-secondary/40 to-background">
      <header className="container flex items-center justify-between py-6">
        <Logo size="md" />
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          Zurück zum Shop
        </Link>
      </header>
      <main className="container flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
