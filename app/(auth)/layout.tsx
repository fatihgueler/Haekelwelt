import Link from 'next/link';
import { ArrowLeft, Heart, Package, Sparkles } from 'lucide-react';

import { HeroArt } from '@/components/illustrations/hero-art';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_0.9fr]">
      <div className="bg-granny flex flex-col">
        <header className="container flex items-center justify-between py-6">
          <Logo size="md" />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Zurück zum Shop
          </Link>
        </header>
        <main id="inhalt" className="container flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      <aside
        aria-label="Vorteile eines Kontos"
        className="relative hidden overflow-hidden bg-primary-soft lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12"
      >
        <HeroArt className="h-auto w-full max-w-md" />
        <ul className="mt-8 w-full max-w-md space-y-3 text-sm">
          {[
            { icon: Heart, text: 'Lieblingsstücke auf der Wunschliste sammeln' },
            { icon: Package, text: 'Bestellungen und Lieferstatus im Blick' },
            { icon: Sparkles, text: 'Schneller zur Kasse beim nächsten Mal' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-2xl bg-card/80 px-4 py-3">
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="font-medium text-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
