import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { NewsletterForm } from '@/components/storefront/newsletter-form';
import { Separator } from '@/components/ui/separator';

const shopLinks = [
  { label: 'Alle Produkte', href: '/produkte' },
  { label: 'Amigurumi', href: '/kategorie/amigurumi' },
  { label: 'Heimdeko', href: '/kategorie/heimdeko' },
  { label: 'Accessoires', href: '/kategorie/accessoires' },
  { label: 'Babys & Kinder', href: '/kategorie/babys-und-kinder' },
];

const serviceLinks = [
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Versand', href: '/versand' },
];

const legalLinks = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'AGB', href: '/agb' },
  { label: 'Widerruf', href: '/widerruf' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground">
              Handgehäkelte Unikate, Dekoration und Geschenke. Mit Liebe in Deutschland gefertigt.
            </p>
          </div>
          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Service" links={serviceLinks} />
          <FooterColumn title="Rechtliches" links={legalLinks} />
          <NewsletterForm />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Häkelwelt. Alle Rechte vorbehalten.</p>
          <p>Preise inkl. der gesetzlichen deutschen MwSt., zzgl. Versand.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
