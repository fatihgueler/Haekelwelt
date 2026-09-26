import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { NewsletterForm } from '@/components/storefront/newsletter-form';
import { Separator } from '@/components/ui/separator';
import { getNavCategories } from '@/lib/categories';
import { SERVICE_LINKS } from '@/lib/category-theme';

const serviceLinks = [...SERVICE_LINKS];

const legalLinks = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'AGB', href: '/agb' },
  { label: 'Widerruf', href: '/widerruf' },
];

export async function Footer() {
  const categories = await getNavCategories();
  const shopLinks = [
    { label: 'Alle Produkte', href: '/produkte' },
    ...categories.map((c) => ({ label: c.name, href: `/kategorie/${c.slug}` })),
  ];

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
      <h2 className="font-serif text-base font-semibold text-foreground sm:text-base">{title}</h2>
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
