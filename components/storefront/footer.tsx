import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { NewsletterForm } from '@/components/storefront/newsletter-form';
import { Separator } from '@/components/ui/separator';
import { getNavCategories } from '@/lib/categories';
import { SERVICE_LINKS } from '@/lib/category-theme';
import { PicotDivider } from '@/components/illustrations/motifs';
import { isPlaceholder, SITE } from '@/lib/site-config';

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

  const socialLinks = [
    { label: 'Instagram', href: SITE.instagramUrl },
    { label: 'Pinterest', href: SITE.pinterestUrl },
  ].filter((l) => !isPlaceholder(l.href));

  return (
    <footer className="mt-auto">
      <PicotDivider className="text-secondary" />
      <div className="bg-secondary">
        <div className="container py-12 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.5fr]">
            <div className="space-y-4">
              <Logo size="md" />
              <p className="max-w-xs text-sm text-muted-foreground">
                Handgehäkelte Unikate, Dekoration und Geschenke – mit Liebe und viel Wolle in
                Deutschland gefertigt.
              </p>
              {socialLinks.length > 0 ? (
                <ul className="flex gap-3 text-sm">
                  {socialLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary underline underline-offset-4"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <FooterColumn title="Shop" links={shopLinks} />
            <FooterColumn title="Service" links={serviceLinks} />
            <FooterColumn title="Rechtliches" links={legalLinks} />
            <div className="sm:col-span-2 lg:col-span-1">
              <NewsletterForm />
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Häkelwelt · Mit ♥ von Hand gehäkelt</p>
            <p>
              Preise inkl. MwSt., zzgl.{' '}
              <Link href="/versand" className="underline underline-offset-4 hover:text-primary">
                Versand
              </Link>
            </p>
          </div>
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
              className="inline-flex min-h-8 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
