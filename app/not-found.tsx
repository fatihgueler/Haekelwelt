import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-secondary/30 to-background">
      <header className="container py-6">
        <Logo />
      </header>
      <main className="container flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">404</p>
        <h1 className="font-serif text-4xl tracking-tight">Diese Masche ist verloren gegangen.</h1>
        <p className="max-w-md text-muted-foreground">
          Die Seite, die du suchst, existiert nicht (mehr). Vielleicht magst du dich in unserer
          Kollektion umsehen?
        </p>
        <Button asChild size="lg">
          <Link href="/produkte">Zur Kollektion</Link>
        </Button>
      </main>
    </div>
  );
}
